import '@mdxeditor/editor/style.css'
import { MDXEditor, headingsPlugin, BoldItalicUnderlineToggles, toolbarPlugin, UndoRedo, InsertImage, imagePlugin, MDXEditorMethods, BlockTypeSelect, ListsToggle, listsPlugin } from '@mdxeditor/editor'
import { RefObject } from 'react'
import { Divider } from '@nextui-org/react'
import ImageUpload from './functions/ImageUpload'
import { toast } from 'react-toastify'

interface Props {
    editorRef: RefObject<MDXEditorMethods>,
    markdown: string
}

export default function TextEditor(props: Props) {
    const imageUploadHandler = async (image: File) => {
        const uploadImage = new Promise<string>((resolve, _reject) => {
            const reader = new FileReader()
            reader.onload = async () => {
                const imgData = reader.result as string
                const url = await ImageUpload(imgData, image.name)
                if (url.error) {
                    resolve("")
                    toast.error("An error occured while uploading the image.")
                } else {
                    resolve(url.data.url)
                    toast.success(url.data.msg)
                }
            }
            reader.readAsDataURL(image)
        })
        const url = await uploadImage
        return url
    }

    return (
        <MDXEditor markdown={props.markdown} ref={props.editorRef} placeholder="Start writing..." className="overflow-y-auto h-full max-h-full w-full" plugins={[
            headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
            listsPlugin(),
            toolbarPlugin({
                toolbarContents: () => (
                    <>
                        <UndoRedo />
                        <Divider orientation='vertical' />
                        <BoldItalicUnderlineToggles />
                        <BlockTypeSelect />
                        <Divider orientation='vertical' />
                        <ListsToggle />
                        <Divider orientation='vertical' />
                        <InsertImage />
                    </>
                )
            }),
            imagePlugin({ imageUploadHandler }),
        ]} />
    )
}