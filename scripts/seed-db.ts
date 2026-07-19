import { runSeed } from '@/lib/db-seed';

const force = process.argv.includes('--force');

runSeed({ force })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
