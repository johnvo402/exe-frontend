'use client';

import Link from 'next/link';
import { LayoutGrid, LogOut, ListOrdered } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/types';
import { useTranslations } from 'next-intl';
type UserNavProps = {
  user: KindeUser<Record<string, unknown>>;
  isAdmin: boolean;
};

export function UserNav({ user, isAdmin }: UserNavProps) {
  const t = useTranslations('UserNav');
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.picture ?? ''} alt="Avatar" />
                  <AvatarFallback className="bg-transparent">
                    {user.family_name}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="z-[101]" side="bottom">
            Profile
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56 z-[101]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.family_name} {user?.given_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isAdmin && (
            <DropdownMenuItem className="hover:cursor-pointer">
              <Link
                href="/dashboard"
                className={buttonVariants({
                  size: 'lg',
                  variant: 'ghost',
                })}
              >
                <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
                {t('dashboard')} ✨
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="hover:cursor-pointer">
            <Link
              href="/order"
              className={buttonVariants({
                size: 'lg',
                variant: 'ghost',
              })}
            >
              <ListOrdered className="w-4 h-4 mr-3 text-muted-foreground" />
              {t('order')}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer">
          <LogoutLink
            className={buttonVariants({
              size: 'lg',
              variant: 'ghost',
            })}
          >
            <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
            {t('signout')}
          </LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
