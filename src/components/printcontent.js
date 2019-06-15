import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import axios from "axios"

import { PrintSheet, Logo, Button } from "./common"
import { cheatsheetMap, contributorMap } from "../utils"

import githubLogo from "../images/github.png"

const PrintSingleContent = styled.div`
  color: #fff;
  column-count: 2;
  @media screen {
    margin: 25px;
  }
`

const PrintSheetTitle = styled.tr`
  background: #333;
  & .title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & a {
      transform: scale(0.75);
    }
  }
  & th {
    padding: 0;

    & h3 {
      margin-bottom: 0;
      padding: 10px 15px;
      font-size: 18px;
    }
  }

  & td {
    padding: 0;
    & p {
      color: #fff;
      margin-bottom: 0;
      font-size: 16px;
      padding: 15px;
    }
  }

  & .contributor {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10px;
    & li {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin: 0 5px;
      margin-bottom: 15px;
      > img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-bottom: 0;
      }

      & .profile {
        margin-left: 10px;
        & h4 {
          margin-bottom: 0;
        }
        & p {
          display: flex;
          align-items: end;
          padding: 0;
          & img {
            width: 18px;
            height: 18px;
            margin-bottom: 0;
          }
          & span {
            font-family: "SFMono-Regular", Consolas, "Roboto Mono",
              "Droid Sans Mono", "Liberation Mono", Menlo, Courier, monospace;
            font-size: 13px;
          }
        }
      }
    }
  }

  & .foot {
    & p {
      margin-bottom: 0;
    }
    padding: 15px;
    & .website {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      & a {
        margint-left: 10px;
        transform: scale(1.1);
      }
      & .slogan {
        display: flex;
        flex-direction: column;
        line-height: 1;
        text-align: right;
      }
    }
  }
`

const PrintCode = styled.tr`
  & .item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    color: #333;
    padding: 10px 15px;
    & p {
      margin-bottom: 0;
      font-size: 16px;
    }
    & .code {
      margin-bottom: 0;
      padding: 0;
      background: none;
      @media print {
        white-space: pre-wrap;
      }
    }
  }
`

const PrintButton = styled.div`
  position: fixed;
  bottom: 25px;
  left: calc(50% - 45px);
  z-index: 1;
  ::after {
    position: absolute;
    content: "";
    top: -20px;
    left: -20px;
    height: 70px;
    width: 140px;
    background: #000;
    opacity: 0.35;
    z-index: -1;
    filter: blur(25px);
  }
  @media print {
    display: none;
  }
`

export default ({ data: rawData, filename }) => {
  const data = cheatsheetMap(rawData)
  const [contributors, setContributors] = useState(null)

  const getContributors = async () => {
    try {
      const { data } = await axios(
        `https://api.github.com/repos/devsonket/devsonket.github.io/commits?path=data/${filename}.json`
      )
      if (data.length) {
        setContributors(contributorMap(data))
      } else {
        setContributors(null)
      }
    } catch (e) {
      setContributors(null)
    }
    setTimeout(() => {
      window.print()
    }, 3000)
  }

  useEffect(() => {
    if (!contributors) {
      getContributors()
    }

    return () => {
      clearTimeout()
    }
  })
  return (
    <PrintSingleContent>
      <PrintSheet>
        <PrintSheetTitle>
          <th className="title">
            <h3>{data.title}</h3>
            <Logo noColor />
          </th>
        </PrintSheetTitle>
        <PrintSheetTitle>
          <td>
            <p>{data.description}</p>
          </td>
        </PrintSheetTitle>
      </PrintSheet>
      {data.contents.map(({ title, items, code: onlyCode }, index) => (
        <PrintSheet id={index + 1} key={index}>
          <PrintSheetTitle>
            <th>
              <h3>{title}</h3>
            </th>
          </PrintSheetTitle>
          {items ? (
            items.map(({ definition, code }, index) => (
              <PrintCode key={index}>
                <td className="item">
                  {definition && (
                    <p
                      className="def"
                      dangerouslySetInnerHTML={{ __html: definition }}
                    />
                  )}
                  {code && (
                    <pre className="code">
                      <code>{code}</code>
                    </pre>
                  )}
                </td>
              </PrintCode>
            ))
          ) : (
            <PrintCode>
              <td>
                <pre className="code">
                  <code>{onlyCode}</code>
                </pre>
              </td>
            </PrintCode>
          )}
        </PrintSheet>
      ))}
      <PrintSheet>
        {contributors && (
          <PrintSheetTitle>
            <td>
              <p>এই চিটশিটে কন্ট্রিবিউট করেছেনঃ</p>
              <ul className="contributor">
                {Object.keys(contributors).map(contributor => (
                  <li key={contributor}>
                    <img
                      alt={contributors[contributor].login}
                      src={contributors[contributor].avatar_url}
                    />
                    <div className="profile">
                      <h4>{contributors[contributor].name}</h4>
                      <p>
                        <img alt="username" src={githubLogo} />/
                        <span>{contributors[contributor].login}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </td>
          </PrintSheetTitle>
        )}
        <PrintSheetTitle>
          <th className="foot">
            <div className="website">
              <Logo noColor />
              <div className="slogan">
                <p>বাংলা চিটশিটের ভান্ডার</p>
                <p>devsonket.com</p>
              </div>
            </div>
          </th>
        </PrintSheetTitle>
      </PrintSheet>
      <PrintButton>
        <Button
          onClick={() => window.print()}
          text="প্রিন্ট করুন"
          bgColor="#02b3e4"
        />
      </PrintButton>
    </PrintSingleContent>
  )
}