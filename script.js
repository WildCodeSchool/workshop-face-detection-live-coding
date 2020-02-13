const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models'),
])
.then(startVideo)


function startVideo() {

    navigator.getUserMedia(
        {video: {}},
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas);
    const displaySize = {width: video.width,
                        height: video.height}
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withAgeAndGender()
            .withFaceExpressions()
            console.log(detections)
            canvas.getContext('2d').clearRect(0,0, 
                                    canvas.width, canvas.height);
            faceapi.matchDimensions(canvas, displaySize)
            const resizedDetections = faceapi.resizeResults(
                detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas,resizedDetections)
            resizedDetections.forEach( result => {
                const {age, gender, genderProbability} = result;
                new faceapi.draw.DrawTextField(
                    [
                        `${faceapi.utils.round(age,0)} years`,
                        `${gender} (${faceapi.utils.round(genderProbability,2)})` 
                    ],
                    result.detection.box.bottomRight
                ).draw(canvas)
            })
            
    }, 100)
})
