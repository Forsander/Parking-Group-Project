import React from "react";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
  logoSrc?: string;

};

export function PageHeader({ title, children, logoSrc = "/logo.png" }: PageHeaderProps) {
  return (
    <header className="sticky top-0 left-0 right-0 z-[9999] w-full border-b border-primary/20 bg-primary p-4">
      <div className="mx-auto max-w-4xl">
        <div className="relative flex items-center">
          <h1 className="text-2xl font-bold text-primary-foreground">{title}</h1>

          <img
            src={logoSrc}
            alt="SpotSpot"
            className="absolute left-1/2 h-24 w-auto -translate-x-1/2"
          />
        </div>

        {children ? <div className="mt-3">{children}</div> : null}
      </div>
    </header>
  );
}