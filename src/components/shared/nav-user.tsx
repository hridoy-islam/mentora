import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Power } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/redux/features/authSlice';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export function NavUser({ user }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  console.log(user);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg grayscale">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="rounded-lg text-white">
                {user?.name.charAt(0)}{' '}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2 p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={handleLogout}
                      className="flex cursor-pointer items-center rounded-md p-2 hover:bg-theme/20"
                    >
                      <div className="flex flex-row items-center justify-center gap-1">
                        <Power className="h-4 w-4" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
