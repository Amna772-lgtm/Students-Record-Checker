const retryMech = async (fn, maxRetries = 5) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        throw error;
      }

      const backoff = 1000 * Math.pow(2, attempts);
      console.log(
        `Attempt ${attempts} failed. Retrying in ${backoff / 1000} seconds...`
      );

      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
};

module.exports = { retryMech };
