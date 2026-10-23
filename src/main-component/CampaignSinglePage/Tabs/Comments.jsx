import React from 'react'
import { Link } from 'react-router-dom'
import blog5 from '../../../images/blog-details/comments-author/img-3.jpg'

const SubmitHandler = (e) => {
    e.preventDefault()
}

const Comments = () => {
    return (
        <div id="Comments" className="wpo-blog-single-section">
            <div className="comments-area">
                <div className="comments-section">
                    <h3 className="comments-title">Comments</h3>
                    <p>No comments yet.</p>
                </div>
            </div>
            <div className="comment-respond">
                <h3 className="comment-reply-title">Leave a Comment</h3>
                <form method="post" id="commentform" className="comment-form" onSubmit={SubmitHandler}>
                    <div className="form-inputs">
                        <input placeholder="Name" type="text" />
                        <input placeholder="Email" type="email" />
                        <input placeholder="Website" type="url" />
                    </div>
                    <div className="form-textarea">
                        <textarea id="comment"
                            placeholder="Write Your Comments..."></textarea>
                    </div>
                    <div className="form-submit">
                        <input id="submit" value="Reply" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Comments;