import { Container } from 'react-bootstrap'
import "./RecordingAPIDemo.css";

export default function RecordingAPIDemo() {


        //webkitURL is deprecated but nevertheless
        URL = window.URL || window.webkitURL;

        var mediaStream; 					//stream from getUserMedia()
        var recorder; 						//MediaRecorder object
        var chunks = [];					//Array of chunks of audio data from the browser
        var extension;
        
        var recordButton;
        var stopButton;
        var pauseButton;
        let countRecordings = 0;


        window.addEventListener('DOMContentLoaded', function loader() {
           recordButton = document.getElementById("recordButton");
           stopButton = document.getElementById("stopButton");
           pauseButton = document.getElementById("pauseButton");

           //add events to those 2 buttons
           recordButton.addEventListener("click", startRecording);
           stopButton.addEventListener("click", stopRecording);
           pauseButton.addEventListener("click", pauseRecording);
         }, { once: true });

    
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) { extension="webm"; }
        else{ extension="ogg" }
    
    
        function startRecording() {
            /*
                Simple constraints object
            */
            var constraints = {audio: true}
    
            /*
                Set starting disabled parameters for 3 buttons 
            */
    
            recordButton.disabled = true;
            stopButton.disabled = false;
            pauseButton.disabled = false
    
            /*
                We're using the standard promise based getUserMedia() 
                https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
            */
    
            navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
                mediaStream = stream;
    
                var options = {
                audioBitsPerSecond :  256000,
                videoBitsPerSecond : 2500000,
                bitsPerSecond:       2628000,
                mimeType : 'audio/'+extension+';codecs=opus'
                }
    
                //update the format 
                document.getElementById("formats").innerHTML='Sample rate: 48kHz, MIME: audio/'+extension+';codecs=opus';
    
                /* 
                    Create the MediaRecorder object
                */
                recorder = new MediaRecorder(stream, options);
    
                //when data becomes available add it to our attay of audio data
                recorder.ondataavailable = function(e){
                    // add stream data to chunks
                    chunks.push(e.data);
                    // if recorder is 'inactive' then recording has finished
                    if (recorder.state == 'inactive') {
                    // convert stream data chunks to a 'webm' audio format as a blob (a file-like object of immutable, raw data)
                    const blob = new Blob(chunks, { type: 'audio/'+extension, bitsPerSecond:128000});
                    createDownloadLink(blob)
                    }
                };
    
                //start recording using 1 second chunks
                //Chrome and Firefox will record one long chunk if you do not specify the chunck length
                recorder.start(1000);
    
            }).catch(function(err) {
                //enable the record button if getUserMedia() fails
                recordButton.disabled = false;
                stopButton.disabled = true;
                pauseButton.disabled = true
            });
        }
    
        function pauseRecording(){
            if (recorder.state=="recording"){
                //pause
                recorder.pause();
                pauseButton.innerHTML="Resume";
            }else if (recorder.state=="paused"){
                //resume
                recorder.resume();
                pauseButton.innerHTML="Pause";
    
            }
        }
    
        function stopRecording() {
            countRecordings++;
            if (countRecordings != 0) {
               recordButton.innerHTML = "Restart Recording!";
            }
    
            //disable the stop and pause button, enable the record buttons
            stopButton.disabled = true;
            recordButton.disabled = false;
            pauseButton.disabled = true;
    
            //reset button just in case the recording is stopped while paused
            pauseButton.innerHTML="Pause";
            
            //tell the recorder to stop the recording
            recorder.stop();
    
            //stop microphone access
            mediaStream.getAudioTracks()[0].stop();
            
        }
    
        function createDownloadLink(blob) {
            
            var url = URL.createObjectURL(blob);
            var au = document.createElement('audio');
            var li = document.createElement('li');
            var link = document.createElement('a');
            var recordingsList = document.getElementById("recordingsList")
    
            //add controls to the <audio> element
            au.controls = true;
            au.src = url;
    
            //link the a element to the blob
            link.href = url;
            link.download = new Date().toISOString() + '.'+extension;
            link.innerHTML = link.download;
    
            //add the new audio and a elements to the li element
            li.appendChild(au);
            li.appendChild(link);
    
            //add the li element to the ordered list
            recordingsList.appendChild(li);
        }
   

       return (
           <Container>
               <div>
                   <div id="controls">
                       <button id="recordButton">Record</button>
                       <button id="pauseButton" disabled>Pause</button>
                       <button id="stopButton" disabled>Stop</button>
                   </div>
                   <div id="formats"></div>
                   <p><strong>Recordings:</strong></p>
                   <ol id="recordingsList"></ol>
               </div>
           </Container>
       );


   }