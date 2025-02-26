export interface BlogPost {
  id: number;
  title: string;
  image: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  authorImage: string;
  authorBio: string;
  tags: string[];
}
  
  export interface RashiSign {
    name: string;
    hindiName: string;
    image: string;
  }
  
  export interface ConsultingTopic {
    title: string;
    description: string;
    image: string;
  }