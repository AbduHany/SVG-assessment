import { DeleteOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  List,
  Popconfirm,
  Typography,
  message,
} from "antd";
import type { Comment } from "../store/commentSlice";
import { addComment, deleteComment } from "../store/commentSlice";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resolvePermissions } from "../utils/permissionChecker";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Comments = () => {
  const [newComment, setNewComment] = useState("");
  const dispatch = useAppDispatch();

  const comments = useAppSelector((state) => state.comments.comments);
  const user = useAppSelector((state) => state.auth.user);
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);

  const { canView, canCreate, canDelete } = resolvePermissions(
    permissions ?? [],
    "comments",
    isAdmin
  );

  const handleSubmit = () => {
    if (!newComment.trim() || !canCreate) {
      return;
    }

    dispatch(
      addComment({
        authorId: user?.id ?? "unknown",
        authorName: user?.name ?? "Unknown",
        content: newComment.trim(),
      })
    );
    setNewComment("");
    message.success("Comment posted");
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      return;
    }
    dispatch(deleteComment(id));
    message.success("Comment deleted");
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
            />
            <div className="flex justify-end">
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={!newComment.trim() || !canCreate}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <List
        className="bg-white rounded-lg shadow-sm p-4"
        itemLayout="horizontal"
        dataSource={comments}
        locale={{ emptyText: "No comments yet" }}
        renderItem={(item: Comment) => (
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
                  {(item.authorName?.[0] ?? "?").toUpperCase()}
                </Avatar>
              }
              title={
                <div className="flex justify-between items-center">
                  <span>{item.authorName}</span>
                  <Text type="secondary" className="text-xs">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </div>
              }
              description={
                <Text className="text-gray-800">{item.content}</Text>
              }
              className="p-4"
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Comments;
