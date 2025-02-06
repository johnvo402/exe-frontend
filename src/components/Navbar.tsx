import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';
import { buttonVariants } from './ui/button';
import { ArrowRight } from 'lucide-react';
import {
  getKindeServerSession,
  LoginLink,
  LogoutLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/server';
import { checkRole } from '@/lib/useRoleAndPermission';
import Image from 'next/image';

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const isAdmin = await checkRole('admin-exe');

  return (
    <nav className="sticky text-2xl z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <Image src="/logo-no-bg.png" alt="logo" width={100} height={100} />
          </Link>

          <div className="h-full flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/order"
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'ghost',
                  })}
                >
                  Your Orders
                </Link>
                <LogoutLink
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'ghost',
                  })}
                >
                  Sign out
                </LogoutLink>

                {isAdmin ? (
                  <Link
                    href="/dashboard"
                    className={buttonVariants({
                      size: 'lg',
                      variant: 'ghost',
                    })}
                  >
                    Dashboard ✨
                  </Link>
                ) : null}
                <Link
                  href="/configure/design"
                  className={buttonVariants({
                    size: 'lg',
                    className: 'hidden sm:flex items-center gap-1',
                  })}
                >
                  Create T-Shirt
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <RegisterLink
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'ghost',
                  })}
                >
                  Sign up
                </RegisterLink>

                <LoginLink
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'ghost',
                  })}
                >
                  Login
                </LoginLink>

                <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

                <Link
                  href="/configure/design"
                  className={buttonVariants({
                    size: 'lg',
                    className: 'hidden sm:flex items-center gap-1',
                  })}
                >
                  Create T-Shirt
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
