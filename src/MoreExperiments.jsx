import { Fragment } from 'react';

import { Text, Space, A, Ul, Li } from 'jbx';

// <Li>
//   <A href="https://clashjs.com/">ClashJS</A>, JS AI Battle Game.
// </Li>

// <Li>
//   <A href="https://javier.xyz/img2css/">img2css</A>, tool that can
//   convert any image into a pure css image.
// </Li>

function MoreExperiments() {
  return (
    <Fragment>
      <Text>More experiments:</Text>
      <Space h={0.5} />
      <Text>
        <Ul>
          <Li>
            <A href="https://javier.xyz/pintr/">PINTR</A>, tool that turns your
            images into plotter-like line drawings.
          </Li>

          <Li>
            <A href="https://javier.xyz/visual-center/">Visual Center</A>, find
            the visual center of your images / logos.
          </Li>
          <Li>
            <A href="https://brutalita.com">Brutalita</A>, a monospace font that
            you can edit in the browser.
          </Li>
        </Ul>
      </Text>
    </Fragment>
  );
}

export default MoreExperiments;
