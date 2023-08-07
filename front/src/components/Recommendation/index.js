import React from 'react';

import {
  RecommendContainer,
  RecommendWrapper,
  RecommendHeading,
  RecommendPara1,
} from './RecommendElements'


const RecommendSection = () => {
  return (
    <>
      <RecommendContainer id='recommendation'>
        <RecommendWrapper>
          <RecommendHeading>Recommendations</RecommendHeading>
          <RecommendPara1>
How to act on these insights <br/> <br/>

With the information provided there are some key areas for focus. This tab will summarise the key actions needing to be taken, advising the marketer where prioritisation should be placed.
</RecommendPara1>
         </RecommendWrapper>
      </RecommendContainer>      
    </>
  );
}
export default RecommendSection;