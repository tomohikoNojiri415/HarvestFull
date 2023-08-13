import React, {useState} from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop';
import Services from '../components/Services';
import BookingCurveSection from '../components/BookingCurveSection';
import ProfileSection from '../components/ProfileSection';
import CMQSection from '../components/CMQSection';
import RecommendSection from '../components/Recommendation';
const Harvest = () => {
  const [isopen, setisopen] = useState(+false);
  const toggle = () => {
    setisopen(!isopen)
  }
  return (
    <>
      <ScrollToTop />
      <Sidebar isopen={isopen} toggle={toggle}/>
      <Navbar toggle={toggle}/>
      <Services />
      <BookingCurveSection />
      <ProfileSection />
      <CMQSection/>
      <RecommendSection/>
    </>
  )
}



export default Harvest
