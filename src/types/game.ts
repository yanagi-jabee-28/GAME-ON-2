export interface Game {
  id: string;
  name: string;
  description: string;
  component: (props: { onBack: () => void }) => any;
}