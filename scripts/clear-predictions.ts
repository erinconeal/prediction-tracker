import { clearPredictions } from '@/lib/db-clear-predictions';

clearPredictions()
  .then(() => {
    console.log('Cleared predictions and sources. Topics kept.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
