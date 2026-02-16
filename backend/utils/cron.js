import cron from 'node-cron';
import axios from 'axios';

const setupCronJob = () => {
  cron.schedule('*/14 * * * *', async () => {
    try {
      // Replace with your Render backend URL
      const backendUrl = 'https://art-bloom.onrender.com/'; 
      console.log(`Pinging backend to keep it alive: ${backendUrl}`);
      
      const response = await axios.get(backendUrl);
      console.log(`Ping successful: ${response.status}`);
    } catch (error) {
      console.error(`Ping failed: ${error.message}`);
    }
  });

  console.log('Cron job scheduled to ping backend every 14 minutes.');
};

export default setupCronJob;
