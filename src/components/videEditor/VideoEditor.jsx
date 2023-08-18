import {Slider, Spin} from 'antd'
import {sliderValueToVideoTime} from '../../utils/utils'
import { useEffect, useState } from 'react'
import VideoPlayer from '../videoPlayer/VideoPlayer'
import VideoUpload from '../videoUpload/VideoUpload'
import VideoConversionButton from '../videoConversionButton/VideoConversionButton'
import {createFFmpeg} from '@ffmpeg/ffmpeg'


const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.8.3/dist/ffmpeg-core.js",
});


const VideoEditor = () => {
    const[ffmpegLoaded,setFFmpegLoaded] = useState(false);
    const [videoFile, setVideoFile]= useState()
    const[sliderValues, setSliderValues]=useState([0,100])
    const[videoPlayer, setVideoPlayer]=useState()
    const[gifURL, setGifURL]=useState();
    const[videoPlayerState, setVideoPlayerState]=useState()
    const [processing, setProcessing]=useState(false)
    


    useEffect(()=>{
        ffmpeg.load().then(()=>{
            setFFmpegLoaded(true)
        })
    }, []);

    useEffect(()=>{
        const min=sliderValues[0];
        if(min !== undefined && videoPlayerState && videoPlayer){
            videoPlayer.seek(sliderValueToVideoTime(videoPlayerState.duration,min))
        }
    }, [sliderValues]);
    useEffect(()=>{
        if(videoPlayer && videoPlayerState){
            const[min, max] = sliderValues;
            const minTime = sliderValueToVideoTime(videoPlayerState.duration, min)
            const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max)

            if(videoPlayerState.currentTime < minTime){
                videoPlayer.seek(minTime);
            }
            if(videoPlayerState.currentTime>maxTime){
                videoPlayer.seek(minTime)
            }
        }
    },[videoPlayerState]);


    useEffect(()=>{
        if(!videoFile){
            setVideoPlayerState(undefined)
            setSliderValues([0,100])
            setVideoPlayerState(undefined)
            setGifURL(undefined)
        }
    }, [videoFile])

  return (


<Spin spinning={processing || !ffmpegLoaded} tip={!ffmpegLoaded?"Waiting for ffmpeg to load...":"Processing"}>
    <div>
        {
            videoFile?(
                <VideoPlayer
                src={URL.createObjectURL(videoFile)}
                onPlayerChange={(videoPlayer)=>{
                    setVideoPlayer(videoPlayer)
                }}
                onChange={(videoPlayerState)=>{
                    setVideoPlayerState(videoPlayerState)
                }}
                />
            ):(
                <h2>Upload a video</h2>
            )}

    </div>
    <div className="upload-div">
        <VideoUpload disabled={!!videoFile}
        onChange={(videoFile)=>{
            setVideoFile(videoFile)
        }}
        />
    </div>
    <div className="slider-div">
        <Slider
disabled={!videoPlayerState}
value={sliderValues}
range={true}
onChange={(values)=>{
    setSliderValues(values)
}}
tooltip={{
    formatter:null,
}}/>
<div className="conversion-div">
    <VideoConversionButton
    onConversionStart={()=>{
        setProcessing(true)
    }}
    onConversionEnd={()=>{
        setProcessing(false)
    }}
    ffmpeg={ffmpeg}
    videoPlayerState={videoPlayerState}
    sliderValues={sliderValues}
    videoFile={videoFile}
    onGifCreated={(gifURL)=>{
        setGifURL(gifURL)
    }}
    />
</div>
{
    gifURL && (
        <div className="gif-div">
            <h3>Resulting GIF</h3>
            <img src={gifURL}  className="gif" alt={"GIF file generated in the client side"}/>
            <a href={gifURL} download={"test.gif"} className='ant-btn ant-btn-default'>Download</a>
        </div>
    )
}
    </div>
</Spin>



  )
}

export default VideoEditor