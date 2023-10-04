import { useLocation } from "react-router-dom";

function isAuthRoute(pathname) {
  return pathname === "/login" || pathname === "/register";
}

function LayoutFilter(props) {
  const location = useLocation();

  if (isAuthRoute(location.pathname)) {
    return null;
  }

  return (
    <>
    {props.children}
    </>
  );
}

export default LayoutFilter;