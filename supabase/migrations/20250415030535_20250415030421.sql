drop policy "メッセージ投稿権限" on "public"."messages";

drop policy "メッセージ閲覧権限" on "public"."messages";

drop policy "ルーム作成権限" on "public"."room";

drop policy "ルーム更新権限" on "public"."room";

drop policy "ルーム閲覧権限" on "public"."room";

drop policy "ユーザーは自分のデータを管理できる" on "public"."user";

alter table "public"."messages" disable row level security;

alter table "public"."room" disable row level security;

alter table "public"."user" disable row level security;


