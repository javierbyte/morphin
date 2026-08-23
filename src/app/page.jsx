import { MainHeader, Text, Space, Container, A, MoreExperiments } from 'jbx';

import MorphinApp from '@/components/MorphinApp.jsx';

export default function Page() {
  return (
    <Container>
      <MainHeader>morphin</MainHeader>

      <Space h={1} />
      <Text>
        Tool that creates animated CSS transitions. Add sprites and get the code
        ready to paste in your site.
      </Text>

      <Space h={2} />

      <MorphinApp />

      <Space h={2} />
      <Text>
        For a simpler image to box-shadow conversion, see{' '}
        <A href="https://javier.xyz/img2css">img2css</A>.
      </Text>

      <Space h={2} />

      <MoreExperiments exclude="morphin" />

      <Space h={2} />
      <Text>
        Made by <A href="https://javier.xyz">Javier Bórquez</A>. Online since
        2016.
      </Text>
      <Space h={3} />
    </Container>
  );
}
