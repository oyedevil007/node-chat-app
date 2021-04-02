const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('Input')
const $messageFormButton = $messageForm.querySelector('button')
//elements
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML 
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

//auto-scroll
const autoscroll = ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles =  getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message Container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message' , (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate , {
        username : message.username ,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll();
})

socket.on('LocationMessage' , (message)=>{
    console.log(message);
    const html = Mustache.render(locationTemplate , {
        username : message.username ,
        url : message.url ,
        createdAt : moment(message.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll();
})

socket.on('roomdata' , ({room , users})=>{
    const html = Mustache.render(sidebarTemplate , {
        room ,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit' , (e)=>{
    e.preventDefault();
   // disable
    $messageFormButton.setAttribute('disabled' , 'disabled')

    const msg = e.target.elements.message.value;
    socket.emit('sendmessage' , msg , (error)=>{
       // enable
      $messageFormButton.removeAttribute('disabled')
      $messageFormInput.value = '';
      $messageFormInput.focus()

        if(error){
            return console.log(error);
        }
        console.log('This message was delivered :) ');
    })
   
})

$sendLocationButton.addEventListener('click' , ()=>{
    if(!navigator.geolocation)
    {
        return alert('Uhoh , Geolocation is not supported in your browser ')
    }
    
    navigator.geolocation.getCurrentPosition((position)=>{
       // console.log(position)
       //disable

       $sendLocationButton.setAttribute('disabled' , 'disabled')

        socket.emit('sendLocation' , {
            latitude : position.coords.latitude ,
            longitude : position.coords.longitude
        } , ()=>{
            //enable
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location Shared :)')
        })
        
        
    })
})

socket.emit('join' , {username , room} , (error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }
})