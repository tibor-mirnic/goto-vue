import './style.css';
import { renderHomeRoute } from './routes/public/HomeRoute.ts';

renderHomeRoute(document.querySelector<HTMLDivElement>('#app')!);
