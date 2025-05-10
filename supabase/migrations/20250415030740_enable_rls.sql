-- RLSを明示的に有効化
ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

-- テーブルのRLS強制
ALTER TABLE "public"."user" FORCE ROW LEVEL SECURITY;
ALTER TABLE "public"."room" FORCE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" FORCE ROW LEVEL SECURITY;

-- RLSポリシーの再作成（もし存在する場合は上書き）
DROP POLICY IF EXISTS "ユーザーは自分のデータを管理できる" ON "public"."user";
CREATE POLICY "ユーザーは自分のデータを管理できる" ON "public"."user"
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "ルーム作成権限" ON "public"."room";
CREATE POLICY "ルーム作成権限" ON "public"."room"
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "ルーム閲覧権限" ON "public"."room";
CREATE POLICY "ルーム閲覧権限" ON "public"."room"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "ルーム更新権限" ON "public"."room";
CREATE POLICY "ルーム更新権限" ON "public"."room"
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "メッセージ閲覧権限" ON "public"."messages";
CREATE POLICY "メッセージ閲覧権限" ON "public"."messages"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "メッセージ投稿権限" ON "public"."messages";
CREATE POLICY "メッセージ投稿権限" ON "public"."messages"
  FOR INSERT
  WITH CHECK (true); 