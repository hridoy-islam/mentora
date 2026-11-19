import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MoveLeft,
  Trash2,
  GraduationCap,
  Building2,
  ShoppingCart,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { selectStyles } from '..';

type BuyerType = 'student' | 'company';

interface UserOption {
  value: string;
  label: string;
  role: string;
}

interface CourseOption {
  value: string;
  label: string;
  price: number;
}

interface LineItem {
  courseId: string;
  title: string;
  unitPrice: string; // kept as string so the input can be edited freely
  quantity: string;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'complimentary', label: 'Complimentary (free)' },
  { value: 'other', label: 'Other' }
];
const STRIPE_METHOD = { value: 'stripe', label: 'Stripe (online)' };

const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid — enrol / add seats now' },
  { value: 'pending', label: 'Pending — awaiting payment' }
];

const money = (n: number) =>
  `£${(Number.isFinite(n) ? n : 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const statusColor: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-700'
};

/** Create a manual order, or edit an existing order (route param `id`). */
export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const isEdit = !!orderId;
  const { toast } = useToast();

  const [buyerType, setBuyerType] = useState<BuyerType>('student');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [existing, setExisting] = useState<any | null>(null);

  const [buyer, setBuyer] = useState<UserOption | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [discountPct, setDiscountPct] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [paymentStatus, setPaymentStatus] = useState(
    isEdit ? PAYMENT_STATUSES[1] : PAYMENT_STATUSES[0]
  );
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Paid orders and Stripe orders: only payment details / notes are editable.
  const isStripeOrder =
    isEdit && (!existing?.paymentMethod || existing.paymentMethod === 'stripe');
  const isDelivered =
    isEdit && (existing?.paymentStatus === 'paid' || !!existing?.fulfilledAt);
  const linesLocked = isEdit && (isStripeOrder || isDelivered);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, courseRes, orderRes] = await Promise.all([
          axiosInstance.get('/users', {
            params: { limit: 'all', fields: 'name,email,role' }
          }),
          axiosInstance.get('/courses', {
            params: { limit: 'all', fields: 'title,price' }
          }),
          isEdit
            ? axiosInstance.get(`/order/${orderId}/details`)
            : Promise.resolve(null)
        ]);

        const userList = userRes.data?.data?.result || userRes.data?.data || [];
        setUsers(
          userList
            .filter((u: any) => u.role === 'student' || u.role === 'company')
            .map((u: any) => ({
              value: u._id,
              label: `${u.name}${u.email ? ` (${u.email})` : ''}`,
              role: u.role
            }))
        );
        const courseList = courseRes.data?.data?.result || [];
        setCourses(
          courseList.map((c: any) => ({
            value: c._id,
            label: c.title,
            price: Number(c.price) || 0
          }))
        );

        const order = orderRes?.data?.data;
        if (order) {
          setExisting(order);
          setBuyerType(order.role === 'company' ? 'company' : 'student');
          if (order.buyerId?._id) {
            setBuyer({
              value: order.buyerId._id,
              label: `${order.buyerId.name}${order.buyerId.email ? ` (${order.buyerId.email})` : ''}`,
              role: order.buyerId.role || order.role
            });
          }
          setItems(
            (order.items || []).map((i: any) => ({
              courseId: i.courseId?._id || i.courseId,
              title: i.courseId?.title || 'Unknown course',
              unitPrice: String(i.unitPrice ?? 0),
              quantity: String(i.quantity ?? 1)
            }))
          );
          const pct = Number(order.discount) * 100;
          setDiscountPct(pct > 0 ? String(Math.round(pct * 100) / 100) : '');
          setPaymentMethod(
            PAYMENT_METHODS.find((m) => m.value === order.paymentMethod) ||
              STRIPE_METHOD
          );
          setReference(order.transactionId || '');
          setNote(order.note || '');
        }
      } catch (err: any) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            err?.response?.data?.message ||
            (isEdit
              ? 'Failed to load the order.'
              : 'Failed to load users or courses.')
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const buyerOptions = useMemo(
    () => users.filter((u) => u.role === buyerType),
    [users, buyerType]
  );

  const availableCourses = useMemo(
    () => courses.filter((c) => !items.some((i) => i.courseId === c.value)),
    [courses, items]
  );

  const switchBuyerType = (type: BuyerType) => {
    if (type === buyerType || linesLocked) return;
    setBuyerType(type);
    setBuyer(null);
    // Students can only hold one seat per course.
    if (type === 'student') {
      setItems((prev) => prev.map((i) => ({ ...i, quantity: '1' })));
    }
  };

  const addCourse = (option: CourseOption | null) => {
    if (!option) return;
    setItems((prev) => [
      ...prev,
      {
        courseId: option.value,
        title: option.label,
        unitPrice: String(option.price),
        quantity: '1'
      }
    ]);
  };

  const updateItem = (courseId: string, patch: Partial<LineItem>) =>
    setItems((prev) =>
      prev.map((i) => (i.courseId === courseId ? { ...i, ...patch } : i))
    );

  const removeItem = (courseId: string) =>
    setItems((prev) => prev.filter((i) => i.courseId !== courseId));

  const isComplimentary =
    paymentMethod.value === 'complimentary' && !linesLocked;
  const qtyOf = (i: LineItem) =>
    buyerType === 'student'
      ? 1
      : Math.max(1, Math.floor(Number(i.quantity) || 1));
  const priceOf = (i: LineItem) =>
    isComplimentary ? 0 : Math.max(0, Number(i.unitPrice) || 0);

  const subtotal = items.reduce((sum, i) => sum + priceOf(i) * qtyOf(i), 0);
  const discountFraction =
    Math.min(100, Math.max(0, Number(discountPct) || 0)) / 100;
  const discountAmount = subtotal * discountFraction;
  const total = linesLocked
    ? Number(existing?.totalAmount) || 0
    : subtotal - discountAmount;
  const totalSeats = items.reduce((sum, i) => sum + qtyOf(i), 0);

  const handleSubmit = async () => {
    setError('');

    if (!linesLocked) {
      if (!buyer) {
        setError(
          `Select a ${buyerType === 'student' ? 'student' : 'organization'}.`
        );
        return;
      }
      if (items.length === 0) {
        setError('Add at least one course.');
        return;
      }
      const badPrice = items.find(
        (i) =>
          i.unitPrice === '' ||
          Number(i.unitPrice) < 0 ||
          isNaN(Number(i.unitPrice))
      );
      if (!isComplimentary && badPrice) {
        setError(`Enter a valid price for "${badPrice.title}".`);
        return;
      }
    }

    const lines = linesLocked
      ? {}
      : {
          buyerId: buyer!.value,
          items: items.map((i) => ({
            courseId: i.courseId,
            quantity: qtyOf(i),
            unitPrice: isComplimentary ? 0 : Number(i.unitPrice)
          })),
          discount: discountFraction
        };

    const body: Record<string, any> = {
      ...lines,
      transactionId: reference,
      note,
      ...(!isStripeOrder && { paymentMethod: paymentMethod.value }),
      ...(!linesLocked && { paymentStatus: paymentStatus.value })
    };

    setSubmitting(true);
    try {
      const res = isEdit
        ? await axiosInstance.patch(`/order/${orderId}/admin`, body)
        : await axiosInstance.post('/order/admin', body);
      const order = res.data?.data;

      const delivered = !linesLocked && paymentStatus.value === 'paid';
      toast({
        title: isEdit
          ? `Order ${order?.orderRef || ''} updated`
          : `Order ${order?.orderRef || ''} created`,
        description: delivered
          ? buyerType === 'company'
            ? 'Licence seats have been added to the organization.'
            : 'The student has been enrolled.'
          : linesLocked
            ? 'Payment details saved.'
            : 'Saved as pending. Mark it as paid once payment arrives.'
      });
      navigate('/dashboard/orders');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not save the order.';
      setError(msg);
      toast({ variant: 'destructive', title: 'Save failed', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingOptions) {
    return (
      <div className="flex justify-center py-12">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-gray-500">
          Order not found.
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/orders')}
          >
            <MoveLeft className="mr-2 h-4 w-4" /> Back to orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  const submitLabel = submitting
    ? 'Saving...'
    : isEdit
      ? !linesLocked && paymentStatus.value === 'paid'
        ? 'Save & mark as paid'
        : 'Save changes'
      : paymentStatus.value === 'paid'
        ? 'Create paid order'
        : 'Create pending order';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div>
          <CardTitle className="flex items-center gap-3">
            {isEdit ? (
              <>
                Edit Order
                <span className="font-mono text-base text-muted-foreground">
                  {existing?.orderRef}
                </span>
                <Badge
                  className={`border-0 ${statusColor[existing?.paymentStatus] || ''}`}
                >
                  {existing?.paymentStatus?.toUpperCase()}
                </Badge>
              </>
            ) : (
              'Create Order'
            )}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? 'Update the order details. What can be changed depends on whether it has been paid.'
              : 'Record a purchase paid outside Stripe — bank transfer, cash, invoice or complimentary.'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>
          <MoveLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {linesLocked && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isStripeOrder
                ? 'This is a Stripe order. The buyer, courses and amount were fixed when the customer paid online, so only the reference and note can be edited.'
                : 'This order has been paid and delivered (student enrolled / seats added). Only the payment method, reference and note can be edited.'}
            </span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="divide-y lg:col-span-2">
            {/* Buyer */}
            <section className="space-y-4 py-6 first:pt-0 last:pb-0">
              <h3 className="text-base font-semibold">1. Buyer</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        type: 'student',
                        label: 'Student',
                        hint: 'One seat per course, enrolled directly',
                        Icon: GraduationCap
                      },
                      {
                        type: 'company',
                        label: 'Organization',
                        hint: 'Buys seats to assign to staff',
                        Icon: Building2
                      }
                    ] as const
                  ).map(({ type, label, hint, Icon }) => (
                    <button
                      key={type}
                      type="button"
                      disabled={linesLocked}
                      onClick={() => switchBuyerType(type)}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        buyerType === type
                          ? 'border-supperagent bg-supperagent/5 ring-1 ring-supperagent'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <span>
                        <span className="block text-sm font-medium">
                          {label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {hint}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>
                    {buyerType === 'student' ? 'Student' : 'Organization'}
                  </Label>
                  <Select
                    options={buyerOptions}
                    value={buyer}
                    onChange={(o) => setBuyer(o)}
                    isLoading={loadingOptions}
                    isDisabled={linesLocked}
                    placeholder={`Search ${buyerType === 'student' ? 'students' : 'organizations'}...`}
                    isClearable
                    styles={selectStyles}
                    className="text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Courses */}
            <section className="space-y-4 py-6 first:pt-0 last:pb-0">
              <h3 className="text-base font-semibold">2. Courses</h3>
              <div className="space-y-4">
                {!linesLocked && (
                  <Select
                    options={availableCourses}
                    value={null}
                    onChange={(o) => addCourse(o)}
                    isLoading={loadingOptions}
                    placeholder="Add a course..."
                    styles={selectStyles}
                    className="text-sm"
                    formatOptionLabel={(o: CourseOption) => (
                      <div className="flex justify-between gap-4">
                        <span className="truncate">{o.label}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {money(o.price)}
                        </span>
                      </div>
                    )}
                  />
                )}

                {items.length === 0 ? (
                  <div className="flex flex-col items-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
                    <ShoppingCart className="mb-2 h-8 w-8 text-gray-300" />
                    No courses added yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead className="w-[130px]">
                          Unit price (£)
                        </TableHead>
                        <TableHead className="w-[100px]">
                          {buyerType === 'company' ? 'Seats' : 'Qty'}
                        </TableHead>
                        <TableHead className="w-[110px] text-right">
                          Subtotal
                        </TableHead>
                        {!linesLocked && <TableHead className="w-[50px]" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.courseId}>
                          <TableCell className="font-medium">
                            {item.title}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={isComplimentary ? '0' : item.unitPrice}
                              disabled={isComplimentary || linesLocked}
                              onChange={(e) =>
                                updateItem(item.courseId, {
                                  unitPrice: e.target.value
                                })
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              value={
                                buyerType === 'student' ? '1' : item.quantity
                              }
                              disabled={buyerType === 'student' || linesLocked}
                              title={
                                buyerType === 'student'
                                  ? 'Students can only buy one seat per course'
                                  : undefined
                              }
                              onChange={(e) =>
                                updateItem(item.courseId, {
                                  quantity: e.target.value
                                })
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(priceOf(item) * qtyOf(item))}
                          </TableCell>
                          {!linesLocked && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => removeItem(item.courseId)}
                                aria-label={`Remove ${item.title}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </section>

            {/* Payment */}
            <section className="space-y-4 py-6 first:pt-0 last:pb-0">
              <h3 className="text-base font-semibold">3. Payment</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Payment method</Label>
                  <Select
                    options={isStripeOrder ? [STRIPE_METHOD] : PAYMENT_METHODS}
                    value={paymentMethod}
                    onChange={(o) => o && setPaymentMethod(o)}
                    isDisabled={isStripeOrder}
                    styles={selectStyles}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment status</Label>
                  {linesLocked ? (
                    <div className="flex h-9 items-center">
                      <Badge
                        className={`border-0 ${statusColor[existing?.paymentStatus] || ''}`}
                      >
                        {existing?.paymentStatus?.toUpperCase()}
                      </Badge>
                    </div>
                  ) : (
                    <Select
                      options={PAYMENT_STATUSES}
                      value={paymentStatus}
                      onChange={(o) => o && setPaymentStatus(o)}
                      styles={selectStyles}
                      className="text-sm"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    max={100}
                    value={discountPct}
                    disabled={isComplimentary || linesLocked}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">
                    {isStripeOrder ? 'Transaction ID' : 'Payment reference'}
                  </Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Receipt / bank ref / invoice no."
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="note">Internal note</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional — visible to admins only"
                    rows={3}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Summary */}
          <div>
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4 lg:sticky lg:top-4">
              <h3 className="text-base font-semibold">Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyer</span>
                  <span className="max-w-[60%] truncate text-right font-medium">
                    {buyer?.label.replace(/\s\(.*\)$/, '') || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Courses</span>
                  <span>{items.length}</span>
                </div>
                {buyerType === 'company' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total seats</span>
                    <span>{totalSeats}</span>
                  </div>
                )}
                {isEdit && existing?.createdBy?.name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by</span>
                    <span>{existing.createdBy.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 border-t pt-3 text-sm tabular-nums">
                {!linesLocked && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>
                          Discount ({(discountFraction * 100).toFixed(0)}%)
                        </span>
                        <span>−{money(discountAmount)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between pt-1 text-base font-semibold">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting || loadingOptions}
                className="w-full bg-supperagent hover:bg-supperagent/90"
              >
                {submitLabel}
              </Button>
              {!linesLocked && (
                <p className="text-xs text-muted-foreground">
                  No Stripe charge is made.{' '}
                  {paymentStatus.value === 'paid'
                    ? buyerType === 'company'
                      ? 'Seats are added to the organization immediately.'
                      : 'The student is enrolled immediately.'
                    : 'Nothing is delivered until the order is marked as paid.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
