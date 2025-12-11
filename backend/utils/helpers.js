const axios = require('axios');

// Función para hacer scraping y obtener el URL de previsualización
async function getPreviewUrl(trackUrl) {
  try {
    const response = await axios.get(trackUrl);
    const match = response.data.match(/"audioPreview":\{.*?"url":"(.*?)"/);
    if (match && match[1]) {
      return match[1].replace(/\\/g, '');
    }
    return null;
  } catch (error) {
    console.error('Error scraping:', error);
    return null;
  }
}

// Shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para encontrar la mejor combinación de canciones
function findClosestSum(tracks, targetDuration) {
  let start = 0, end = 0;
  let currSum = tracks[0].duration, minDiff = Number.MAX_SAFE_INTEGER;
  let bestStart = 0, bestEnd = 0;
  minDiff = Math.abs(currSum - targetDuration);
  while (end < tracks.length - 1) {
    if (currSum < targetDuration) {
      end++;
      currSum += tracks[end].duration;
    } else {
      currSum -= tracks[start].duration;
      start++;
    }
    if (Math.abs(currSum - targetDuration) < minDiff) {
      minDiff = Math.abs(currSum - targetDuration);
      bestStart = start;
      bestEnd = end;
    }
  }
  // Añadir más canciones de la lista inicial si es necesario
  while (currSum < targetDuration && end < tracks.length - 1) {
    end++;
    currSum += tracks[end].duration;
    if (Math.abs(currSum - targetDuration) < minDiff) {
      minDiff = Math.abs(currSum - targetDuration);
      bestEnd = end;
    }
  }
  return {
    combination: tracks.slice(bestStart, bestEnd + 1),
    durationDifference: minDiff
  };
}

module.exports = { getPreviewUrl, shuffleArray, findClosestSum };