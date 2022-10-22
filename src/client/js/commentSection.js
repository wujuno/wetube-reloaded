const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".video__comment-delete");


const addComment = (text, newCommentId) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    newComment.dataset.id= newCommentId;
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    const span2 = document.createElement("span");
    span.innerText = `${text}`;
    span2.innerText = "❌";
    span2.className = "video__comment-delete"
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
    span2.addEventListener("click",handleDelete);
}

const handleSubmit = async (event)=> {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === "") {
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({text:text}),
    });
    if(response.status === 201){
        textarea.value= "";
        const {newCommentId} = await response.json();
        addComment(text,newCommentId);
    }
}

if(form){
    form.addEventListener("submit", handleSubmit);
}

const handleDelete = async (event)=>{
    const li = event.target.parentElement;
    const commentId = event.target.parentElement.dataset.id;
    const response = await fetch(`/api/videos/${commentId}/deletecomment`,{
        method: "DELETE",
    })
    if(response.status === 201){
    li.remove();
    }
}


if (deleteBtn) {
    deleteBtn.forEach((btn) => btn.addEventListener("click", handleDelete));
};
