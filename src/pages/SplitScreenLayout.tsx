import React from "react";


interface SplitScreenLayoutProps {
  formSide: React.ReactNode;
  isLogin: boolean;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({ formSide, isLogin }) => {
  const cyanPanelClass =
    "bg-cyan-600 text-white p-8 md:p-16 flex flex-col justify-center items-center shadow-2xl transition-all duration-700 ease-in-out";
  const whitePanelClass =
    "bg-theme-secondary text-theme-primary p-8 md:p-16 flex flex-col justify-center items-center shadow-2xl transition-all duration-700 ease-in-out";

  const marketingContent = isLogin
    ? {
        title: "Welcome back!",
        text: "Please sign in to access your existing account and continue your journey.",
      }
    : {
        title: "Hello Friend!",
        text: "Join our community! Enter your personal details to create your new account.",
      };

  const isFormOnLeft = isLogin;

 
  const marketingPanel = (
    <div
      className={`w-1/2 hidden md:flex ${cyanPanelClass} ${
        isFormOnLeft ? "rounded-r-2xl" : "rounded-l-2xl"
      }`}
    >
      <div className="relative w-full h-full flex flex-col justify-center items-start">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">{marketingContent.title}</h2>
        <p className="text-lg md:text-xl opacity-90 leading-relaxed">{marketingContent.text}</p>
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-50 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 500 500" preserveAspectRatio="none">
            <path
              fill="#ffffff22"
              d="M0,250C0,150,150,0,250,0C350,0,500,150,500,250C500,350,350,500,250,500C150,500,0,350,0,250Z"
              transform="translate(0 0) scale(1.2)"
            />
            <path
              stroke="#ffffff44"
              strokeWidth="2"
              fill="none"
              d="M100,100 Q 250,50 400,100 T 400,300 Q 250,350 100,300 Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );

 
  const formPanel = (
    <div
      className={`w-full md:w-1/2 ${whitePanelClass} ${
        isFormOnLeft ? "rounded-l-2xl" : "rounded-r-2xl"
      } max-w-none`}
    >
  
      <div className="flex flex-col md:hidden mb-6 text-center">
        <h2 className="text-3xl font-extrabold mb-2">{marketingContent.title}</h2>
        <p className="text-lg opacity-90">{marketingContent.text}</p>
      </div>

      <div
        key={isLogin ? "login" : "register"}
        className="w-full transition-opacity duration-500 ease-in-out animate-fade-in-slide-up"
      >
        {formSide}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl">
        {isFormOnLeft ? (
          <>
            {formPanel}
            {marketingPanel}
          </>
        ) : (
          <>
            {marketingPanel}
            {formPanel}
          </>
        )}
      </div>
    </div>
  );
};
