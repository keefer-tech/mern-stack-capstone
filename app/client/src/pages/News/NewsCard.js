import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Grid,
} from "@material-ui/core";
import React, { useState } from "react";
import useStyles from "./NewsStyles";
import { Link, Redirect } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getDate = (date) => {
  const formattedDate = date.slice(0, 10).split("-").reverse().join("-");
  console.log(formattedDate);
  return formattedDate;
};

export default function NewsCard(props) {
  const classes = useStyles();
  const { post } = props;
  const auth = useAuth();
  const [edit, setEdit] = useState(false);

  const handleEdit = () => {
    setEdit(true);
  };
  const { isSuper } = auth;

  return (
    <React.Fragment>
      {edit && <Redirect to="/dashboard" />}
      <Grid item xs={12} md={6}>
        <Card
          className={classes.newsCard}
          style={{ backgroundImage: `url(${post.image_url})` }}
        >
          <Link to={`/news/${post._id}`} component={CardActionArea}>
            <CardContent className={classes.newsCardContent}>
              <h1 className={classes.cardTitle}>{post.title}</h1>
              <h6 className={classes.cardDate}>{getDate(post.created_at)}</h6>
              <h5 className={classes.cardByline}>{post.byline}</h5>
            </CardContent>
          </Link>

          {isSuper && (
            <CardActions>
              <Chip
                size="small"
                label="edit"
                className={classes.editChip}
                onClick={() => handleEdit()}
              />
            </CardActions>
          )}
        </Card>
      </Grid>
    </React.Fragment>
  );
}
