document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const bar = document.querySelector('.progressbar .bar');
    const contentContainer = document.getElementById('content');
    const postUrlInput = document.getElementById('postUrl');
    const submitted = document.querySelector('.submitted');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const postUrl = postUrlInput.value;

        if (isValidUrl(postUrl)) {
            try {
                // Fetch the content
                const content = await fetchAndDisplayContent(postUrl, bar, form, contentContainer, submitted);
                // If content is fetched successfully, analyse it for toxicity
                if (content !== null) {
                    await analyseContentForToxicity(content);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error('Invalid URL');
        }
    });
});

async function fetchAndDisplayContent(postUrl, bar, form, contentContainer, submitted) {
    showProgressBar(bar);
    try {
        const apiEndpoint = 'https://cyberguardians.onrender.com/scrape';
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: postUrl }),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }

        const jsonData = await response.json();
        const postData = jsonData[0];

        document.getElementById('profileImageUrl').src = postData.ProfilePictureURL || 'placeholder-image-url.png';
        document.getElementById('posterName').textContent = `${postData.FirstName} ${postData.LastName}` || 'Name not available';
        document.getElementById('posterDetails').textContent = `Age: ${postData.Age} | Education: ${postData.Education}` || 'Details not available';
        document.getElementById('postContent').textContent = postData.Content || 'Content not available';

        contentContainer.style.display = 'block';
        form.style.display = 'none';

        return postData.Content;
    } catch (error) {
        console.error('Fetch Error:', error);
        contentContainer.style.display = 'none';
        form.style.display = 'block';
    } finally {
        hideProgressBar(bar);
    }
    return null;
}


async function analyseContentForToxicity(content) {
    try {
        const analysisEndpoint = 'https://google-perspective-api.onrender.com/analyse-content';
        const response = await fetch(analysisEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: content }),
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const analysisResult = await response.json();
        
        const toxicityScore = analysisResult.score;
        document.getElementById('toxicityScore').textContent = `Toxicity Score: ${toxicityScore}`;

        const percentage = Math.round(toxicityScore * 100);
        document.querySelector('.percentage').textContent = `${percentage}%`;
        document.querySelector('.circle').setAttribute('stroke-dasharray', `${percentage}, 100`);

        document.querySelector('.single-chart').style.display = 'block';
    } catch (error) {
        console.error('Error analysing content:', error);
    }
}

function isValidUrl(url) {
    var pattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
    return pattern.test(url);
}

function showProgressBar(bar) {
    bar.parentElement.style.display = 'flex';
    bar.style.width = '0%';
}

function hideProgressBar(bar) {
    bar.parentElement.style.display = 'none';
    bar.style.width = '0%';
}

function animateFormSubmission(submitBtn, bar, submitted, form) {
    // Animation for form submission
    form.style.animation = 'linear .3s push';
    setTimeout(() => {
        submitBtn.style.scale = '1';
    }, 300);
    setTimeout(() => {
        submitBtn.style.animation = 'ease .5s scaleWidth';
    }, 900);
    setTimeout(() => {
        bar.style.bottom = '0px';
    }, 1200);
    setTimeout(() => {
        submitBtn.style.width = '100%';
        bar.style.animation = 'ease .7s scaleBar';
    }, 1390);
    setTimeout(() => {
        bar.style.width = '100%';
    }, 2090);
    setTimeout(() => {
        submitBtn.textContent = 'Submitted!';
        submitted.style.display = 'block';
    }, 2090);
    setTimeout(() => {
        submitted.textContent = 'Submitted!!';
        submitted.style.display = 'block';

    }, 3000);
    setTimeout(() => {
        submitted.style.display = 'none';
        submitBtn.textContent = 'Loading...';
        simulateLoadingProcess(bar, () => {
        });
    }, 6000);
}

function simulateLoadingProcess(bar, onComplete) {
    // Simulation of loading process
    let loadPercentage = 0;
    const loadingInterval = setInterval(() => {
        loadPercentage++;
        bar.style.width = `${loadPercentage}%`;
        if (loadPercentage >= 100) {
            clearInterval(loadingInterval);
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
        }
    }, 100);
}
