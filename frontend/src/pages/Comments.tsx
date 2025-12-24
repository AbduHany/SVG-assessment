import { DeleteOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  List,
  Popconfirm,
  Skeleton,
  Typography,
  message,
} from "antd";
import type { Comment } from "../store/commentSlice";
import {
  createComment,
  deleteComment,
  fetchComments,
} from "../store/commentSlice";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resolvePermissions } from "../utils/permissionChecker";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Comments = () => {
  const [newComment, setNewComment] = useState("");
  const dispatch = useAppDispatch();

  const comments = useAppSelector((state) => state.comments.items);
  const status = useAppSelector((state) => state.comments.status);
  const error = useAppSelector((state) => state.comments.error);
  const user = useAppSelector((state) => state.auth.user);
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);

  const { canView, canCreate, canDelete } = resolvePermissions(
    permissions ?? [],
    "comments",
    isAdmin
  );

  useEffect(() => {
    if (status === "idle" && comments.length === 0) {
      dispatch(fetchComments());
    }
  }, []);

  const handleSubmit = async () => {
    if (!newComment.trim() || !canCreate || status === "loading") {
      return;
    }

    try {
      await dispatch(createComment({ content: newComment.trim() })).unwrap();
      setNewComment("");
      message.success("Comment posted");
    } catch (error) {
      console.error(error);
      message.error("Failed to post comment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete || status === "loading") {
      return;
    }

    try {
      await dispatch(deleteComment(id)).unwrap();
      message.success("Comment deleted");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete comment");
    }
  };

  const userInitial = (user?.name?.[0] ?? "?").toUpperCase();

  if (!canView) {
    return (
      <Card className="text-center p-12">
        <Title level={4}>Access Denied</Title>
        <Text>You do not have permission to view comments.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Title level={2}>Comments</Title>

      <Card className="card-shadow">
        <div className="flex gap-4">
          <Avatar className="bg-blue-600">{userInitial}</Avatar>
          <div className="flex-1 space-y-2">
            <TextArea
              rows={3}
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Write a comment..."
              disabled={!canCreate || status === "loading"}
            />
            <div className="flex justify-end">
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={
                  !newComment.trim() || !canCreate || status === "loading"
                }
              >
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {status === "loading" && comments.length === 0 ? (
        <Card className="card-shadow">
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      ) : null}

      {error ? (
        <Card className="card-shadow">
          <Text type="danger">{error}</Text>
        </Card>
      ) : null}

      <List
        className="bg-white rounded-lg shadow-sm p-4"
        itemLayout="horizontal"
        dataSource={comments}
        locale={{ emptyText: "No comments yet" }}
        renderItem={(item: Comment) => {
          const displayName =
            item.user?.name ??
            (item.userId === user?.id ? user?.name : undefined) ??
            "Unknown";

          return (
            <List.Item
              actions={
                canDelete
                  ? [
                      <Popconfirm
                        key="delete"
                        title="Delete comment?"
                        onConfirm={() => handleDelete(item.id)}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar className="bg-gray-200 text-gray-600">
                    {(displayName?.[0] ?? "?").toUpperCase()}
                  </Avatar>
                }
                title={
                  <div className="flex justify-between items-center">
                    <span>{displayName}</span>
                    <Text type="secondary" className="text-xs">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Unknown date"}
                    </Text>
                  </div>
                }
                description={
                  <Text className="text-gray-800">{item.content}</Text>
                }
                className="p-4"
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default Comments;
