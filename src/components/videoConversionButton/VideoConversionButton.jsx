import { Button } from 'antd';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { sliderValueToVideoTime } from '../../utils/utils';

const VideoConversionButton = ({
    videoPlayerState,
    sliderValues,
    videoFile,
    ffmpeg,
    onConversionStart=()=>{},
    onConversionEnd=()=>{},
    onGifCreated=()=>{},
}) => {

    const convertToGif= async ()=>{
    onConversionStart(true);

    const inputFilename="gif.mp4";
    const outputFilename="output.gif";

    ffmpeg.FS("writeFile",inputFilename,await fetchFile(videoFile))


    const [min, max] = sliderValues
    const minTime=sliderValueToVideoTime(videoPlayerState?.duration, min)
    const maxTime=sliderValueToVideoTime(videoPlayerState?.duration, max)


    await ffmpeg?.run("-i",inputFilename, "-ss",`${minTime}`, "-to", `${maxTime}`, "-f","gif", outputFilename)

    const data =  ffmpeg.FS("readFile", outputFilename)

    const gifURL = URL.createObjectURL(new Blob([data.buffer],{type: "image/gif"}))
    onGifCreated(gifURL)
    onConversionEnd(false)
    }
  return (
     <Button onClick={()=>convertToGif()}>Convert to GIF</Button>
  )
}

export default VideoConversionButton