import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';
import { buttonVariants } from './ui/button';
import { ArrowRight } from 'lucide-react';
import {
  getKindeServerSession,
  LoginLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/server';
import Image from 'next/image';
import { UserNav } from './user-nav';
import { checkRole } from '@/lib/useRoleAndPermission';
import LanguageSwitcher from './language-switcher';
import { getTranslations } from 'next-intl/server'; // Import server-side utility

export const Navbar = async () => {
  const { getUser } = getKindeServerSession();

  let user = null;
  let isAdmin = false;

  try {
    user = await getUser();
    if (user) {
      isAdmin = await checkRole('admin-exe');
    }
  } catch (error) {
    console.error('Lỗi khi lấy user hoặc vai trò:', error);
  }

  // Use getTranslations instead of useTranslations
  const t = await getTranslations('Navbar'); // 'Navbar' is the namespace for your translations

  return (
    <nav className="sticky text-2xl z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <Image
              src="/logo-no-bg.png"
              alt="logo"
              width={100}
              height={100}
              priority
            />
          </Link>

          <div className="h-full flex items-center space-x-4">
            <div className="h-8 w-px bg-zinc-200 hidden sm:block" />
            {user ? (
              <>
                <Link
                  href="/configure/design"
                  className={buttonVariants({
                    size: 'lg',
                    className: 'hidden sm:flex items-center gap-1',
                  })}
                >
                  {t('create_tshirt')}
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
                <UserNav user={user} isAdmin={isAdmin} />
              </>
            ) : (
              <>
                <RegisterLink
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'ghost',
                  })}
                >
                  {t('signup')} {/* Use server-side t function */}
                </RegisterLink>

                <LoginLink
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'ghost',
                  })}
                >
                  {t('login')} {/* Use server-side t function */}
                </LoginLink>
              </>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
