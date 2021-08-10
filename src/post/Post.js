import React, { useState, useEffect } from 'react'
import firebase from 'firebase';
import { db } from '../firebase/firebase';
import Avatar from '@material-ui/core/Avatar';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CommentIcon from '@material-ui/icons/Comment';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import './Post.css';

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const Post = ({ imageUrl, username, caption, postId, user, timestamp }) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [totalLove, setTotalLove] = useState(0);
    const [totalComments, setTotalComments] = useState(0);
    const [loves, setLoves] = useState(false);
    const [love, setLove] = useState([]);
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    const [open, setOpen] = useState(false);
    const [isLove, setIsLove] = useState(false)
    const [isClickComment, setIsClickComment] = useState(false)

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
                    setLove(snapshot.docs.map(doc => doc.data()));
                })
        }

        return () => {
            unsubscribe();
        }
    }, [postId]);

    useEffect(() => {
        if (postId && user) {
            db
                .collection("posts")
                .doc(postId)
                .collection("lovePost")
                .doc(user.uid)
                .onSnapshot(snapshot => {
                    setIsLove(snapshot.data()?.isLove);
                })
        }
    }, [postId, user]);

    useEffect(() => {
        let sum = 0;
        love.map(love => { return love.isLove ? sum += 1 : sum += 0 })
        setTotalLove(sum);
    }, [love]);

    useEffect(() => {
        let sum = 0;
        comments.map(comments => { return sum += 1 })
        setTotalComments(sum);
    }, [comments]);

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
        db.collection("posts").doc(postId).collection("lovePost").doc(user?.uid).set({
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
            <div className="post_actions">
                <div>
                    <FavoriteIcon className="post_favoriteIcon" color={isLove ? "secondary" : "action"} onClick={user && lovePost} />
                    <strong className="post_favoriteIcon" onClick={() => setOpen(true)}>{totalLove} like</strong>
                </div>
                <div onClick={() => { user && setIsClickComment(!isClickComment) }} >
                    <CommentIcon color={isClickComment ? "secondary" : "action"} className="post_favoriteIcon" />
                    <strong className="post_favoriteIcon">{totalComments} Comments</strong>
                </div>
            </div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}>
                <div style={modalStyle} className={classes.paper}>
                    <center>
                        <img
                            className="app_headerImage"
                            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
                            alt="" />
                    </center>
                    {love.map((love, id) => {
                        return (
                            love.isLove && (
                                <div className="post_userLove">
                                    <Avatar className="post_avatar" alt={love.username} src="/static/images/avatar/1.jpg" />
                                    <p key={id}>{love.username}</p>
                                </div>
                            )
                        );
                    })}
                </div>
            </Modal>
            <h4 className="post_text"><strong>{username}</strong>{caption}
                <p>{timestamp?.toDate().toLocaleDateString()}  {timestamp?.toDate().toLocaleTimeString()}</p>
            </h4>
            <div className={isClickComment ? "post_commentsBoxShow" : "post_hideCommentBox"}>
                {
                    comments.map((comment, id) => {
                        return (
                            <>
                                <p key={id} className="post_userComments">
                                    <Avatar className="post_avatar" alt={love.username} src="/static/images/avatar/1.jpg" />
                                    <strong>{comment.username}</strong> {comment.text}
                                    <p className="post_comments_timestamp">{comment.timestamp?.toDate().toLocaleDateString()}  {comment.timestamp?.toDate().toLocaleTimeString()}</p>
                                </p>
                            </>
                        )
                    })
                }
            </div>
            {
                user &&
                <form className={isClickComment ? "post_commentBoxShow" : "post_hideCommentBox"}>
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
        </div >
    )
}

export default Post
