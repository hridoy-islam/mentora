import { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  Search,
  FileText,
  Calendar,
  User,
  Plus,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Pencil,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

interface Option {
  value: string;
  label: string;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: 'Stripe',
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  invoice: 'Invoice',
  complimentary: 'Complimentary',
  other: 'Other'
};

const STATUS_OPTIONS: Option[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '36px',
    borderRadius: '8px',
    boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : 'none'
  }),
  menu: (base: any) => ({ ...base, zIndex: 50 })
};

// Matches the shadcn <Input>: h-9 (36px), 4px radius, gray-300 border.
const filterSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '36px',
    height: '36px',
    borderRadius: '4px',
    borderColor: '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '&:hover': { borderColor: '#d1d5db' }
  }),
  valueContainer: (base: any) => ({ ...base, height: '34px', padding: '0 12px' }),
  input: (base: any) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base: any) => ({ ...base, height: '34px' }),
  menu: (base: any) => ({ ...base, zIndex: 50 })
};

const formatMoney = (n: number | undefined) =>
  `£${Number(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const isManual = (order: any) =>
  !!order.paymentMethod && order.paymentMethod !== 'stripe';

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(20);

  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null);
  const [orderRef, setOrderRef] = useState('');

  // Mark-as-paid dialog
  const [payOrder, setPayOrder] = useState<any | null>(null);
  const [payReference, setPayReference] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders(currentPage, entriesPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, entriesPerPage]);

  const fetchOrders = async (
    page: number,
    limit: number,
    filters: Record<string, string | undefined> = {
      paymentStatus: selectedStatus?.value,
      orderRef: orderRef.trim()
    }
  ) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const response = await axiosInstance.get('/order', { params });
      const data = response.data?.data;
      setOrders(data?.result || []);
      setTotalPages(data?.meta?.totalPage || 1);
      setTotalOrders(data?.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch orders.'
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders(1, entriesPerPage);
  };

  const replaceOrder = (updated: any) => {
    if (!updated?._id) return;
    // Keep populated fields from the list row; take status fields from the response.
    setOrders((prev) =>
      prev.map((o) =>
        o._id === updated._id
          ? {
              ...o,
              paymentStatus: updated.paymentStatus,
              transactionId: updated.transactionId,
              fulfilledAt: updated.fulfilledAt ?? (updated.fulfilled ? new Date() : o.fulfilledAt),
              fulfillmentError: updated.fulfillmentError
            }
          : o
      )
    );
  };

  const handleMarkPaid = async () => {
    if (!payOrder) return;
    setActionLoadingId(payOrder._id);
    try {
      const res = await axiosInstance.patch(`/order/${payOrder._id}/mark-paid`, {
        transactionId: payReference || undefined
      });
      replaceOrder(res.data?.data);
      toast({
        title: 'Order marked as paid',
        description:
          payOrder.role === 'company'
            ? 'Licence seats have been added to the organization.'
            : 'The student has been enrolled.'
      });
      setPayOrder(null);
      setPayReference('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Could not mark as paid',
        description: error?.response?.data?.message || 'Please try again.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRecheckStripe = async (order: any) => {
    setActionLoadingId(order._id);
    try {
      const res = await axiosInstance.get(`/order/verify-payment/${order._id}`);
      const updated = res.data?.data;
      replaceOrder(updated);
      toast({
        title: `Stripe status: ${updated?.paymentStatus?.toUpperCase() || 'UNKNOWN'}`,
        description:
          updated?.paymentStatus === 'paid'
            ? 'Payment confirmed and the order has been fulfilled.'
            : 'Stripe has not confirmed a payment for this order.'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Could not check with Stripe',
        description: error?.response?.data?.message || 'Please try again.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoadingId(cancelTarget._id);
    try {
      const res = await axiosInstance.patch(`/order/${cancelTarget._id}/cancel`);
      replaceOrder(res.data?.data);
      toast({ title: `Order ${cancelTarget.orderRef || ''} cancelled` });
      setCancelTarget(null);
    } catch (error: any) {
      // e.g. Stripe reported it as paid → it was fulfilled instead; refresh the row.
      toast({
        variant: 'destructive',
        title: 'Could not cancel order',
        description: error?.response?.data?.message || 'Please try again.'
      });
      setCancelTarget(null);
      fetchOrders(currentPage, entriesPerPage);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'cancelled':
        return 'bg-gray-200 text-gray-700 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getRoleBadge = (role: string) =>
    role === 'company'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                All course purchases — online (Stripe) and manual orders created by
                admins.
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard/orders/create')}
              className="bg-supperagent hover:bg-supperagent/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="w-[170px]">
              <Select
                options={STATUS_OPTIONS}
                value={selectedStatus}
                onChange={(o) => setSelectedStatus(o)}
                placeholder="All statuses"
                isClearable
                className="text-sm"
                styles={filterSelectStyles}
              />
            </div>
            <Input
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search order ref (ORD-...)"
              className="h-9 w-[240px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="h-9 bg-supperagent hover:bg-supperagent/90"
            >
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-6">
              <BlinkingDots size="large" color="bg-supperagent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-500">
              <FileText className="mb-4 h-12 w-12 text-gray-400" />
              <p>No orders found.</p>
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted-foreground">
                {totalOrders} order{totalOrders === 1 ? '' : 's'}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const manual = isManual(order);
                    const busy = actionLoadingId === order._id;
                    const canMarkPaid =
                      manual &&
                      (order.paymentStatus !== 'paid' || !!order.fulfillmentError);
                    const canRecheck =
                      !manual &&
                      order.paymentStatus !== 'cancelled' &&
                      (order.paymentStatus !== 'paid' || !!order.fulfillmentError);
                    const canCancel =
                      order.paymentStatus === 'pending' || order.paymentStatus === 'failed';

                    return (
                      <TableRow key={order._id}>
                        <TableCell>
                          <div className="font-mono text-xs font-medium">
                            {order.orderRef || '—'}
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {order.createdAt
                              ? moment(order.createdAt).format('DD MMM YYYY, HH:mm')
                              : 'N/A'}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            <User className="h-4 w-4 text-gray-400" />
                            {order.buyerId?.name || 'Unknown User'}
                          </div>
                          {order.buyerId?.email && (
                            <div className="ml-6 text-xs text-gray-500">
                              {order.buyerId.email}
                            </div>
                          )}
                          <Badge
                            variant="outline"
                            className={`ml-6 mt-1 ${getRoleBadge(order.role)}`}
                          >
                            {order.role === 'company' ? 'Organization' : 'Student'}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {order.items?.length ? (
                              order.items.map((item: any, index: number) => (
                                <div key={index} className="flex items-center text-sm">
                                  <span
                                    className="max-w-[220px] truncate text-gray-700"
                                    title={item.courseId?.title}
                                  >
                                    {item.courseId?.title || 'Unknown Course'}
                                  </span>
                                  <Badge variant="secondary" className="ml-2 h-5 text-xs">
                                    ×{item.quantity || 1}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">No items</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-semibold tabular-nums text-gray-700">
                          {formatMoney(order.totalAmount)}
                          {Number(order.discount) > 0 && (
                            <div className="text-xs font-normal text-gray-500">
                              {(Number(order.discount) * 100).toFixed(0)}% off
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <Badge className={`border-0 ${getStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                            </Badge>
                            {manual && (
                              <span className="text-xs text-gray-500">
                                {PAYMENT_METHOD_LABELS[order.paymentMethod] ||
                                  order.paymentMethod}
                                {order.createdBy?.name ? ` · by ${order.createdBy.name}` : ''}
                              </span>
                            )}
                            {order.fulfillmentError && (
                              <span
                                className="flex items-center gap-1 text-xs text-red-600"
                                title={order.fulfillmentError}
                              >
                                <AlertTriangle className="h-3 w-3" /> Not fulfilled
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            size="sm"
                            className="bg-supperagent text-white hover:bg-supperagent/90"
                            onClick={() => navigate(`/dashboard/orders/edit/${order._id}`)}
                            title="Edit order"
                          >
                            <Pencil className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          {canMarkPaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => {
                                setPayOrder(order);
                                setPayReference(order.transactionId || '');
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              {order.paymentStatus === 'paid' ? 'Retry fulfil' : 'Mark paid'}
                            </Button>
                          )}
                          {canRecheck && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => handleRecheckStripe(order)}
                              title="Ask Stripe whether this order was paid, and fulfil it if so"
                            >
                              <RefreshCw className={`mr-1 h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
                              Re-check Stripe
                            </Button>
                          )}
                          {canCancel && (
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => setCancelTarget(order)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              <Ban className="mr-1 h-4 w-4" /> Cancel
                            </Button>
                          )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!payOrder}
        onOpenChange={(open) => {
          if (!open) {
            setPayOrder(null);
            setPayReference('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payment received</DialogTitle>
            <DialogDescription>
              {payOrder?.orderRef} · {formatMoney(payOrder?.totalAmount)} from{' '}
              {payOrder?.buyerId?.name || 'buyer'}.{' '}
              {payOrder?.role === 'company'
                ? 'Licence seats will be added to the organization.'
                : 'The student will be enrolled in the courses.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pay-ref">Payment reference (optional)</Label>
            <Input
              id="pay-ref"
              value={payReference}
              onChange={(e) => setPayReference(e.target.value)}
              placeholder="Receipt no., bank reference, invoice no."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOrder(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaid}
              disabled={actionLoadingId === payOrder?._id}
              className="bg-supperagent hover:bg-supperagent/90"
            >
              {actionLoadingId === payOrder?._id ? 'Saving...' : 'Mark as paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order {cancelTarget?.orderRef}?</DialogTitle>
            <DialogDescription>
              {cancelTarget && !isManual(cancelTarget)
                ? 'We will first check with Stripe that the customer has not paid, then close the payment link so it can no longer be paid.'
                : 'The order will be marked as cancelled. Nothing has been delivered for it, so no enrolments or seats are affected.'}{' '}
              You can re-open a cancelled manual order by editing it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={actionLoadingId === cancelTarget?._id}
            >
              {actionLoadingId === cancelTarget?._id ? 'Cancelling...' : 'Cancel order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
