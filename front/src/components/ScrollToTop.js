import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

//when we click on a link, we want to scroll to the top of the page
export default function ScrollToTop() {
  const {pathname} = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  },[pathname]);
  return null;
}