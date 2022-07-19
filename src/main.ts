import SetupCalendar, { Calendar } from 'v-calendar';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp( App );
app.use( router );

app.use( SetupCalendar, {} );
app.component( 'Calendar', Calendar );
app.mount( '#app' );
