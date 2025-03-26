// app/login/page.tsx
"use client"; // if you need to use client features in the page itself
import AuthenticationFlow from '../components/auth/AuthenticationFlow';

export default function Page() {
  // You can define any page-level logic here.
  // Just render the AuthenticationFlow with whichever props you like.
  return (
    <AuthenticationFlow
      isOpen={true}
      onClose={() => {
        // e.g. route away or hide a modal
      }}
      onAuthenticated={(data) => {
        console.log('User authenticated:', data);
      }}
    />
  );
}
