#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract';
import startContract from '../../snapshots/1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/2d8ff6b4faf4bf02e7fd14b15dabd81636a61f00e600a4ce69664b6f53c58d06/contract';
import endContract from '../../snapshots/2d8ff6b4faf4bf02e7fd14b15dabd81636a61f00e600a4ce69664b6f53c58d06/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'post' }),
      this.dropColumn({ schema: 'public', table: 'user', column: 'createdAt' }),
      this.dropColumn({ schema: 'public', table: 'user', column: 'updatedAt' }),
      this.dropColumn({ schema: 'public', table: 'user', column: 'username' }),
      this.createTable({
        schema: 'public',
        table: 'day',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('date', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('day_of_week', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'dish',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description_en', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('description_vi', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('image', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name_en', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name_vi', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'meal_package',
        columns: [
          col('calories_per_meal', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('duration_days', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('price', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('total_meals', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'menu',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('dish_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id_day', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'order',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('package_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('shipping_address', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('shipping_note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ORDER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('user_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('user_subscription_id', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'order_item',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('dish_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('order_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user_subscription',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('end_date', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id_user', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('package_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('payment_status', 'text', {
            notNull: true,
            default: lit('UNPAID'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('remaining_meals', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('start_date', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('activity_level', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('created_at', 'timestamptz', {
          notNull: true,
          default: fn('now()'),
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('dob', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('gender', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('goal', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('height', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('weight', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-user-password', {
        check: () => placeholder('backfill-user-password:check'),
        run: () => placeholder('backfill-user-password:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'password' }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-user-phone', {
        check: () => placeholder('backfill-user-phone:check'),
        run: () => placeholder('backfill-user-phone:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'phone' }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('updated_at', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.dataTransform(endContract, 'backfill-user-updated_at', {
        check: () => placeholder('backfill-user-updated_at:check'),
        run: () => placeholder('backfill-user-updated_at:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'updated_at' }),
      this.dataTransform(endContract, 'handle-nulls-user-name', {
        check: () => placeholder('handle-nulls-user-name:check'),
        run: () => placeholder('handle-nulls-user-name:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'name' }),
      this.createIndex({
        schema: 'public',
        table: 'menu',
        index: 'menu_dish_id_idx_b6741243',
        columns: ['dish_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'menu',
        index: 'menu_id_day_idx_16c5541c',
        columns: ['id_day'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order',
        index: 'order_package_id_idx_bbf840ab',
        columns: ['package_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order',
        index: 'order_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order',
        index: 'order_user_subscription_id_idx_328e332d',
        columns: ['user_subscription_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order_item',
        index: 'order_item_dish_id_idx_b6741243',
        columns: ['dish_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order_item',
        index: 'order_item_order_id_idx_39ad19ad',
        columns: ['order_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user_subscription',
        index: 'user_subscription_id_user_idx_52684e74',
        columns: ['id_user'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user_subscription',
        index: 'user_subscription_package_id_idx_bbf840ab',
        columns: ['package_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'menu',
        foreignKey: {
          name: 'menu_dish_id_fkey',
          columns: ['dish_id'],
          references: { schema: 'public', table: 'dish', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'menu',
        foreignKey: {
          name: 'menu_id_day_fkey',
          columns: ['id_day'],
          references: { schema: 'public', table: 'day', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order',
        foreignKey: {
          name: 'order_user_subscription_id_fkey',
          columns: ['user_subscription_id'],
          references: { schema: 'public', table: 'user_subscription', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order',
        foreignKey: {
          name: 'order_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order',
        foreignKey: {
          name: 'order_package_id_fkey',
          columns: ['package_id'],
          references: { schema: 'public', table: 'meal_package', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order_item',
        foreignKey: {
          name: 'order_item_order_id_fkey',
          columns: ['order_id'],
          references: { schema: 'public', table: 'order', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order_item',
        foreignKey: {
          name: 'order_item_dish_id_fkey',
          columns: ['dish_id'],
          references: { schema: 'public', table: 'dish', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'user_subscription',
        foreignKey: {
          name: 'user_subscription_id_user_fkey',
          columns: ['id_user'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'user_subscription',
        foreignKey: {
          name: 'user_subscription_package_id_fkey',
          columns: ['package_id'],
          references: { schema: 'public', table: 'meal_package', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
