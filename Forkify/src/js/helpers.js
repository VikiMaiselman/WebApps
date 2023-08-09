async function timer(seconds) {
  return new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error(`Request took too long! Timeout after ${seconds} seconds`)
        ),
      1000 * seconds
    );
  });
}

export async function getJSON(url) {
  try {
    const response = await fetch(url);
    const recipeData = await response.json();

    if (!response.ok)
      throw new Error(
        `Something went wrong. ${recipeData.message} ${response.statusText}`
      );

    return recipeData;
  } catch (err) {
    throw err;
  }
}
