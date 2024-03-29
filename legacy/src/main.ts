import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import { createPinia } from 'pinia';
import SetupCalendar, { Calendar } from 'v-calendar';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
dayjs.extend( utc );
dayjs.extend( isToday );

const pinia = createPinia()
const app = createApp( App );
app.use( router );
app.use( pinia );

app.use( SetupCalendar, {} );
app.component( 'Calendar', Calendar );
app.mount( '#app' );
