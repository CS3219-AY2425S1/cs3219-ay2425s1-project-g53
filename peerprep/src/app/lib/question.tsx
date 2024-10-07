
export default interface Question {
  id: number;
  title: string;
  description: string;
  categories: [{ id: number, name: string }];
  complexity: string;
}
