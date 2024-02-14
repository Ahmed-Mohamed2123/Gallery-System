import { Entity, JoinColumn, Column, OneToOne } from "typeorm";
import { Gender } from "../enums/gender.enum";
import { Favorite } from "../../favorite/entities/favorite.entity";
import { User } from "../../user/entities/user.entity";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("profiles")
export class Profile extends BaseDocument {
  @Column({
    nullable: true
  })
  firstname: string;

  @Column({
    nullable: true
  })
  lastname: string;

  @Column({
    nullable: true,
    enum: Gender
  })
  gender: string;

  @Column({
    nullable: true
  })
  age: number;

  @Column({
    nullable: true
  })
  country: string;

  @Column({
    nullable: true,
    default: "https://via.placeholder.com/150/000"
  })
  image: string;

  @Column({
    nullable: true,
    default: "https://via.placeholder.com/300/000"
  })
  backgroundImage: string;

  @OneToOne(type => Favorite, favorite => favorite.profile, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  @JoinColumn()
  favorite: Favorite;

  @Column()
  favoriteId: string;

  @OneToOne(type => User, user => user.profile, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  user: User;
}
