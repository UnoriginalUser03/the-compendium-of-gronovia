import React from "react";
import styles from "./styles.module.css";
import { NamedLink, Handout as HandoutType } from "../../../data/handouts";
import Link from "@docusaurus/Link";

interface HandoutDescriptionProps {
    handout: HandoutType;
}

export const HandoutDescription: React.FC<HandoutDescriptionProps> = ({ handout }) => {

    const renderNameList = (
        list: NamedLink[],
        includeAnd: boolean = true
    ) => {
        return list.map((item, index) => {
            const isLast = index === list.length - 1;
            const isSecondLast = index === list.length - 2;

            return (
                <React.Fragment key={item.name}>
                    {item.url ? <Link to={item.url}>{item.name}</Link> : <span>{item.name}</span>}
                    {!isLast && (includeAnd && isSecondLast ? " and " : ", ")}
                </React.Fragment>
            );
        });
    };

    return (
        <div className={styles.description}>
            {handout.description && <p>{handout.description}</p>}

            <ul className={styles.metaList}>
                {handout.session && (
                    <li>
                        <strong>Session:</strong>{" "}
                        {handout.session.url ? (
                            <Link to={handout.session.url}>{handout.session.name}</Link>
                        ) : (
                            handout.session.name
                        )}
                    </li>
                )}

                {handout.foundBy?.length ? (
                    <li>
                        <strong>Found by:</strong> {renderNameList(handout.foundBy)}
                    </li>
                ) : null}

                {handout.location && (
                    <li>
                        <strong>Location:</strong> {renderNameList(handout.location, false)}
                    </li>
                )}
            </ul>

            {handout.tags?.length && (
                <div className={styles.tagContainer}>
                    {handout.tags.map((tag) => (
                        <Link key={tag} className={styles.tag} to={`/handouts?tag=${tag}`}>
                            {tag}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};