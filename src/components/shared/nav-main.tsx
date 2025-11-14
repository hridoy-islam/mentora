import { Link, useLocation } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { type Icon } from '@tabler/icons-react';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  url?: string;
  icon?: Icon;
  items?: NavItem[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const renderMenuItem = (item: NavItem, level = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isOpen = openItems[item.title];
    const isActive = item.url === location.pathname;

    return (
      <SidebarMenuItem key={item.title}>
        {hasChildren ? (
          <Collapsible
            open={isOpen}
            onOpenChange={() => toggleItem(item.title)}
            className="hover:border-sidebar-border hover:bg-sidebar-accent w-full rounded-lg border border-transparent"
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={`flex items-center justify-between gap-2 hover:bg-supperagent hover:text-white ${level > 0 ? 'pl-2' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon size={16} />}
                  <span>{item.title}</span>
                </div>
                {isOpen ? (
                  <IconChevronDown size={14} className="text-gray-600 " />
                ) : (
                  <IconChevronRight size={14} className="text-gray-600 " />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-1.5 animate-in slide-in-from-left-3">
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    {subItem.items && subItem.items.length > 0 ? (
                      renderMenuItem(subItem, level + 1)
                    ) : (
                      <SidebarMenuSubItem key={subItem.title}>
                        {subItem.items && subItem.items.length > 0 ? (
                          renderMenuItem(subItem, level + 1)
                        ) : (
                          <SidebarMenuSubButton
                            asChild
                            className={`hover:bg-supperagent hover:text-white ${level > 0 ? 'pl-2' : ''}`}
                          >
                            <Link
                              to={subItem.url || '#'}
                              className="flex items-center gap-2"
                            >
                              {subItem.icon && <subItem.icon size={16} />}
                              <span className="text-xs">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        )}
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenuButton
            asChild
            className={`hover:bg-supperagent hover:text-white ${level > 0 ? 'pl-2' : ''} ${isActive ? 'bg-supperagent text-white' : ''}`}
          >
            <Link to={item.url || '#'} className="flex items-center gap-2">
              {item.icon && <item.icon size={16} />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>{items.map((item) => renderMenuItem(item))}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
