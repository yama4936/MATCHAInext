-- 前回のすべての一般アクセスポリシーを削除
DROP POLICY IF EXISTS "ユーザーは自分のデータを管理できる" ON "public"."user";
DROP POLICY IF EXISTS "ルーム作成権限" ON "public"."room";
DROP POLICY IF EXISTS "ルーム閲覧権限" ON "public"."room";
DROP POLICY IF EXISTS "ルーム更新権限" ON "public"."room";
DROP POLICY IF EXISTS "メッセージ閲覧権限" ON "public"."messages";
DROP POLICY IF EXISTS "メッセージ投稿権限" ON "public"."messages";

ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "room" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;