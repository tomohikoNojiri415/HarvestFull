import React, {useState} from 'react'
import Video from '../../videos/video.mp4'
import { 
  HeroContainer, 
  HeroBg, 
  VideoBg,
  HeroContent,
  HeroH1,
  HeroP,
  HeroBtnWrapper,
  ArrowForward,
  ArrowRight } from './HeroElements'
import { Button } from '../ButtonElement'
import { Link} from 'react-router-dom';


const HeroSection = () => {
  const [hover, setHover] = useState(false)

  const onHover = () => {
    setHover(!hover)
  }

  return (
    <HeroContainer>
      <HeroBg>
        <VideoBg autoPlay loop muted src={Video} type='video/mp4' />
      </HeroBg>
      <HeroContent>
        <HeroH1>Welcome to Harvest</HeroH1>
        <HeroP>
        Optimising marketing activities through the understanding of consumer behaviour and utilisation of always-on data processing
        </HeroP>
        <HeroBtnWrapper>
            <Button 
              //to='harvest' 
              onMouseEnter = {onHover} 
              onMouseLeave = {onHover}
              primary='true'
              dark='true'
              component = {Link}
              to = '/Harvest'
            >
                Get started {hover ? <ArrowForward /> : <ArrowRight />}            
            </Button>
        </HeroBtnWrapper>
      </HeroContent>
    </HeroContainer>
  )
}

export default HeroSection
