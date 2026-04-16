export interface BlogPost {
  id: string | number;
  slug?: string;
  title: string;
  image: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  dateISO?: string;
  readTime: string;
  authorImage: string;
  authorBio: string;
  tags: string[];
  link?: string;
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