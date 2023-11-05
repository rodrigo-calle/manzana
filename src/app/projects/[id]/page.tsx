"use client";
import { db } from "@/config/firebase";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import React from "react";
import "./calendar.css";
import Calendar from "@/components/calendar/Calendar";
import { Button } from "@/components/ui/buttons/Button";
import { Eye, Trash } from "@phosphor-icons/react";
import TaskModal from "@/components/taskModal/TaskModal";
import ModalForm from "@/components/modalForm/ModalForm";
import ActivityPreview from "@/components/activityPreview/ActivityPreview";
import { ActivitySubcollection, Project } from "@/types/types";
import Loader from "@/components/ui/loader/Loader";

const Project = () => {
  const params = useParams();
  const { id } = params;
  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [openTaskModal, setOpenTaskModal] = React.useState<boolean>(false);
  const [currentActivity, setCurrentActivity] =
    React.useState<ActivitySubcollection | null>(null);
  const [currentActibityDay, setCurrentActivityDay] = React.useState<Timestamp>(
    Timestamp.now()
  );
  const [openPreviewActivityDialog, setOpenPreviewActivityDialog] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    const getProject = async (): Promise<void> => {
      setLoading(true);
      if (typeof id === "string") {
        const projectSnap = await getDoc(doc(db, "habits", id));
        const projectData = projectSnap.data() as Project;
        setProject(projectData);
        const q = query(
          collection(db, "habits", id, "activities"),
          where("date", "==", currentActibityDay)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const activity =
            querySnapshot.docs[0].data() as ActivitySubcollection;
          setCurrentActivity(activity);
        } else {
          setCurrentActivity(null);
        }
      }
      setLoading(false);
    };

    getProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActibityDay, setCurrentActivityDay, updateDoc]);

  if (loading) return <Loader />;

  const handlerDay = () => {
    setOpenTaskModal(!openTaskModal);
  };

  return (
    <>
      {project && (
        <>
          <div className="pt-14 bg-slate-100 h-screen w-full px-4">
            <h1 className="text-2xl mt-7">{project.name}</h1>
            <p className="text-gray-500">{project.description}</p>
            <div className="mt-7 w-full flex flex-row justify-center flex-wrap gap-1">
              <div className="w-fit border-r-2 border-blue-500">
                <Calendar
                  handlerDay={handlerDay}
                  setCurrentActivityDay={setCurrentActivityDay}
                  activity={currentActivity}
                  openDialog={openPreviewActivityDialog}
                  setOpenDialog={setOpenPreviewActivityDialog}
                />
              </div>
              <div className="w-4/12 h-full flex flex-col">
                <div className="flex h-28 flex-row justify-start items-center gap-2">
                  <h1 className="text-bold text-lg">
                    Lista de Tareas de Hábito &ldquo;{project.name}&rdquo;
                  </h1>
                  <p className="text-bold text-xl">|</p>
                  <Button
                    className="bg-blue-500 text-white hover:bg-blue-400"
                    onClick={() => setShowModal(!showModal)}
                  >
                    Agregar tarea
                  </Button>
                </div>
                <div className="w-full mt-1 flex flex-col gap-2">
                  {project.tasks?.map((task, index) => {
                    return (
                      <div
                        className="w-full h-24 bg-white rounded-md shadow-md flex flex-row justify-between items-center px-4"
                        key={index}
                      >
                        <div className="flex flex-col">
                          <p className="text-bold text-lg">{task.name}</p>
                          <p className="text-gray-500">
                            {task.description.length < 35
                              ? task.description
                              : task.description
                                  .toString()
                                  .split("", 35)
                                  .join("") + "..."}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {task.createdAt.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-row gap-1">
                          <Eye
                            size={24}
                            className="text-green-500 cursor-pointer"
                          />
                          <Trash
                            size={24}
                            className="text-red-500 cursor-pointer"
                            onClick={() => {
                              if (typeof id === "string") {
                                setLoading(true);
                                const tasks = project.tasks.filter(
                                  (t) => t.name !== task.name
                                );

                                updateDoc(doc(db, "habits", id), {
                                  tasks,
                                });
                                setLoading(false);
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {currentActivity && (
            <ActivityPreview
              {...currentActivity}
              openDialog={openPreviewActivityDialog}
              setOpenDialog={setOpenPreviewActivityDialog}
            />
          )}
          <TaskModal
            openTaskModal={openTaskModal}
            setOpenTaskModal={setOpenTaskModal}
            currentActivity={currentActivity}
            setCurrentActivity={setCurrentActivity}
            taskList={project.tasks}
            currentActibityDay={currentActibityDay}
            projectId={typeof params.id === "string" ? params.id : ""}
          />
          <ModalForm openModal={showModal} setOpenModal={setShowModal} />
        </>
      )}

      {!project && <div>Project not found</div>}
    </>
  );
};

export default Project;
