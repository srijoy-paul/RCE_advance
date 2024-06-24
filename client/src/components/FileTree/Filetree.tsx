import React, { useState } from "react";
import { Directory, File, sortDir, sortFile } from "../../utils/filesManager";
import { getIcon } from "./icon";

type FileTreeProps = {
  rootDir: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
};

export const FileTree = (props: FileTreeProps) => {
  return <SubTree directory={props.rootDir} {...props} />;
};

type SubTreeProps = {
  directory: Directory;
  selectedFile: File | undefined;
  onSelect: (file: File) => void;
};

const SubTree = (props: SubTreeProps) => {
  return (
    <div>
      {props.directory.dirs.sort(sortDir).map((dir) => (
        <React.Fragment key={dir.id}>
          <DirDiv
            directory={dir}
            selectedFile={props.selectedFile}
            onSelect={props.onSelect}
          />
        </React.Fragment>
      ))}
      {props.directory.files.sort(sortFile).map((file) => (
        <React.Fragment key={file.id}>
          <FileDiv
            file={file}
            selectedFile={props.selectedFile}
            onClick={() => props.onSelect(file)}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

type FileDivProps = {
  file: File | Directory;
  icon?: string;
  selectedFile: File | undefined;
  onClick: () => void;
};

const FileDiv = ({ file, icon, selectedFile, onClick }: FileDivProps) => {
  const isSelected = (selectedFile && selectedFile.id === file.id) as boolean;
  const depth = file.depth;
  return (
    <div
      className={`pl-[${depth * 16}px] ${
        isSelected ? "bg-[#242424]" : "bg-transparent"
      } hover:cursor-pointer hover:bg-[#242424]`}
      onClick={onClick}
    >
      <FileIcon name={icon} extension={file.name.split(".").pop() || ""} />{" "}
      <span className="ml-1">{file.name}</span>
    </div>
  );
};

const DirDiv = ({ directory, selectedFile, onSelect }: SubTreeProps) => {
  let defaultOpen = false;
  if (selectedFile) defaultOpen = isChildSelected(directory, selectedFile);

  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <FileDiv
        file={directory}
        icon={open ? "openDirectory" : "closedDirectory"}
        selectedFile={selectedFile}
        onClick={() => {
          if (!open) {
            onSelect(directory);
          }
          setOpen(!open);
        }}
      />
      {open ? (
        <SubTree
          directory={directory}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      ) : null}
    </>
  );
};

const isChildSelected = (directory: Directory, selectedFile: File) => {
  let res: boolean = false;
  const isChild = (directory: Directory, selectedFile: File) => {
    if (selectedFile.parentId === directory.id) {
      res = true;
      return;
    }
    if (selectedFile.parentId === "0") {
      res = false;
      return;
    }
    directory.dirs.forEach((item) => {
      isChild(item, selectedFile);
    });
  };
  isChild(directory, selectedFile);
  return res;
};

const FileIcon = ({
  extension,
  name,
}: {
  name?: string;
  extension?: string;
}) => {
  let icon = getIcon(extension || "", name || "");
  return <span>{icon}</span>;
};
