import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { messageSchema, MessageType } from "../lib/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function MessageInput() {
  const { sendMessage } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imagePreview, setImagePreview] = useState<null | string>(null);

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    formState: { errors },
  } = useForm<MessageType>({
    resolver: zodResolver(messageSchema),
  });

  const file = watch("file");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    resetField("file");
  };

  const onSubmit = async (data: MessageType) => {
    if (!data.message_content?.trim() && !data.file) {
      toast.error("Please provide a message or an image");
      return;
    }

    try {
      const formData = new FormData();
      if (data.message_content) {
        formData.append("message_content", data.message_content.trim());
      }
      if (data.file && data.file[0]) {
        formData.append("file", data.file[0]);
      }

      await sendMessage(data);

      setImagePreview(null);
      resetField("message_content");
      resetField("file");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2"
      >
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            {...register("message_content")}
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
          />
          {errors.message_content && (
            <p className="text-sm text-red-500 mt-1">
              {errors.message_content.message}
            </p>
          )}
          <input
            type="file"
            accept="image/*"
            {...register("file")}
            ref={(e) => {
              register("file").ref(e);
              fileInputRef.current = e;
            }}
            className="hidden"
            onChange={(e) => {
              register("file").onChange(e);
              handleImageChange(e);
            }}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!watch("message_content")?.trim() && !file?.length}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}
