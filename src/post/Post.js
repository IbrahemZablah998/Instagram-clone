import React, { useState, useEffect } from 'react'
import firebase from 'firebase';
import { db } from '../firebase/firebase';
import Avatar from '@material-ui/core/Avatar';
import FavoriteIcon from '@material-ui/icons/Favorite';
import './Post.css';

const Post = ({ imageUrl, username, caption, postId, user }) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [totalLove, setTotalLove] = useState(0);
    const [loves, setLoves] = useState(false);
    const [love, setLove] = useState([]);

    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db
                .collection("posts")
                .doc(postId)
                .collection("comments")
                .orderBy('timestamp', 'desc')
                .onSnapshot(snapshot => {
                    setComments(snapshot.docs.map(doc => doc.data()))
                })
        }
        return () => {
            unsubscribe();
        }
    }, [postId]);

    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db
                .collection("posts")
                .doc(postId)
                .collection("lovePost")
                .onSnapshot(snapshot => {
                    setLove(snapshot.docs.map(doc => doc.data()))
                })
        }

        return () => {
            unsubscribe();
        }
    }, [postId]);

    useEffect(() => {
        let sum = 0;
        love.map(love => { return love.isLove ? sum += 1 : sum += 0 })
        setTotalLove(sum);
    }, [love]);

    const postComment = (event) => {
        event.preventDefault();
        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        setComment('');
    };

    const lovePost = (event) => {
        event.preventDefault();
        db.collection("posts").doc(postId).collection("lovePost").doc(user.refreshToken).set({
            isLove: !loves,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        setLoves(!loves);
    };

    return (
        <div className="post">
            <div className="post_header">
                <Avatar className="post_avatar"
                    alt={username}
                    src="/static/images/avatar/1.jpg" />
                <h3>{username}</h3>
            </div>

            <img className="post_image" src={imageUrl} alt="" />
            <FavoriteIcon className="post_favoriteIcon" color="secondary" onClick={user && lovePost} />
            <strong className="post_favoriteIcon">{totalLove} like</strong>
            <h4 className="post_text"><strong>{username}</strong>{caption}</h4>

            <div className="post_comments">
                {
                    comments.map((comment, id) => {
                        return <p key={id}>
                            <strong>{comment.username}</strong> {comment.text}
                        </p>
                    })
                }
            </div>
            {user &&
                <form className="post_commentBox">
                    <input
                        className="post_input"
                        type="text"
                        placeholder="Add a comments..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                    <button
                        className="post_button"
                        disabled={!comment}
                        type="submit"
                        onClick={postComment}
                    >
                        Post
                    </button>
                </form>
            }
        </div>
    )
}

export default Post
