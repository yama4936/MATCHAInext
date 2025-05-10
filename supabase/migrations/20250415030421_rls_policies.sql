-- Enable Row Level Security on all tables
ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
-- 1. 自分自身のレコードに対してフルアクセス権を持つ
CREATE POLICY "ユーザーは自分のデータを管理できる" ON "public"."user"
  FOR ALL
  USING (true)  -- 現在の実装ではlocalStorage経由で認証しているため、すべてのアクセスを許可
  WITH CHECK (true);

-- ルームテーブルのポリシー
-- 1. すべてのユーザーがルームを作成できる
CREATE POLICY "ルーム作成権限" ON "public"."room"
  FOR INSERT
  WITH CHECK (true);

-- 2. すべてのユーザーがルームを閲覧できる
CREATE POLICY "ルーム閲覧権限" ON "public"."room"
  FOR SELECT
  USING (true);

-- 3. すべてのユーザーがルームを更新できる (現在の実装では制限なし)
CREATE POLICY "ルーム更新権限" ON "public"."room"
  FOR UPDATE
  USING (true);

-- メッセージテーブルのポリシー
-- 1. 同じルームのメンバーだけがメッセージを閲覧できる
CREATE POLICY "メッセージ閲覧権限" ON "public"."messages"
  FOR SELECT
  USING (true);  -- 現状では制限なしだが、将来的にはroom_passに基づいた制限を追加可能

-- 2. 誰でもメッセージを投稿できる
CREATE POLICY "メッセージ投稿権限" ON "public"."messages"
  FOR INSERT
  WITH CHECK (true);

-- ストレージポリシー
-- ユーザーアイコン用のbucketがなければ作成
INSERT INTO storage.buckets (id, name)
VALUES ('icons', 'icons')
ON CONFLICT DO NOTHING;

-- アイコンストレージのポリシー
CREATE POLICY "ユーザーアイコンアップロード権限" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'icons');

CREATE POLICY "ユーザーアイコン閲覧権限" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'icons');
